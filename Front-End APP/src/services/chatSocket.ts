import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { MessageResponse } from '../types/chat';

type MessageCallback = (message: MessageResponse) => void;
type ReadReceiptCallback = (receipt: { chatId: number; leitorId: number; momento: string }) => void;
type StatusCallback = (connected: boolean) => void;

class ChatSocketService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private shouldReconnect: boolean = true;
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;
  private subIdCounter: number = 0;

  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();
  private readCallbacks: Map<string, Set<ReadReceiptCallback>> = new Map();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private activeSubscriptions: Map<string, string> = new Map(); // destination -> subId

  private getWebSocketUrl(): string {
    const baseUrl = api.defaults.baseURL || 'http://localhost:8080';
    const wsProto = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const host = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `${wsProto}://${host}/ws-chat`;
  }

  public async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) return;

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const token = await AsyncStorage.getItem('token');
      const wsUrl = this.getWebSocketUrl();

      console.log('[ChatSocket] Conectando a:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[ChatSocket] WebSocket aberto, enviando CONNECT STOMP...');
        const connectFrame =
          'CONNECT\n' +
          'accept-version:1.2,1.1,1.0\n' +
          'heart-beat:10000,10000\n' +
          (token ? `Authorization:Bearer ${token}\n` : '') +
          '\n\0';
        this.ws?.send(connectFrame);
      };

      this.ws.onmessage = (event) => {
        this.handleRawMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.warn('[ChatSocket] Erro no WebSocket:', error);
      };

      this.ws.onclose = () => {
        console.log('[ChatSocket] WebSocket desconectado.');
        this.handleDisconnect();
      };
    } catch (e) {
      console.warn('[ChatSocket] Falha ao iniciar conexão:', e);
      this.handleDisconnect();
    }
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    this.isConnecting = false;
    this.notifyStatus(false);
    this.stopHeartbeat();
    this.activeSubscriptions.clear();

    if (this.shouldReconnect) {
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        console.log('[ChatSocket] Tentando reconectar...');
        this.connect();
      }, 4000);
    }
  }

  private handleRawMessage(data: string): void {
    if (typeof data !== 'string') return;

    // Heartbeat ou frame vazio
    if (data === '\n' || data === '\r\n') return;

    // Pode conter múltiplos frames concatenados
    const rawFrames = data.split('\0');
    for (const rawFrame of rawFrames) {
      const trimmed = rawFrame.trim();
      if (!trimmed) continue;
      this.parseStompFrame(trimmed);
    }
  }

  private parseStompFrame(frameStr: string): void {
    const lines = frameStr.split('\n');
    const command = lines[0].trim();

    let headerEndIndex = -1;
    const headers: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') {
        headerEndIndex = i;
        break;
      }
      const sepIndex = line.indexOf(':');
      if (sepIndex !== -1) {
        const key = line.substring(0, sepIndex).trim().toLowerCase();
        const value = line.substring(sepIndex + 1).trim();
        headers[key] = value;
      }
    }

    const body = headerEndIndex !== -1 ? lines.slice(headerEndIndex + 1).join('\n').trim() : '';

    if (command === 'CONNECTED') {
      console.log('[ChatSocket] Conexão STOMP estabelecida com sucesso!');
      this.isConnected = true;
      this.isConnecting = false;
      this.notifyStatus(true);
      this.startHeartbeat();
      this.resubscribeAll();
    } else if (command === 'MESSAGE') {
      const destination = headers['destination'];
      if (!destination || !body) return;

      try {
        const parsed = JSON.parse(body);

        if (destination.includes('/read')) {
          this.readCallbacks.forEach((callbacks, dest) => {
            if (destination === dest || destination.startsWith(dest)) {
              callbacks.forEach((cb) => cb(parsed));
            }
          });
        } else {
          this.messageCallbacks.forEach((callbacks, dest) => {
            if (destination === dest || destination.startsWith(dest)) {
              callbacks.forEach((cb) => cb(parsed));
            }
          });
        }
      } catch (err) {
        console.warn('[ChatSocket] Erro ao processar payload da mensagem:', err);
      }
    } else if (command === 'ERROR') {
      console.warn('[ChatSocket] STOMP Error recebido:', headers['message'] || body);
    }
  }

  private sendFrame(command: string, headers: Record<string, string>, body: string = ''): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    let frame = `${command}\n`;
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += `\n${body}\0`;
    this.ws.send(frame);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('\n');
      }
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private resubscribeAll(): void {
    const allDestinations = new Set([
      ...this.messageCallbacks.keys(),
      ...this.readCallbacks.keys(),
    ]);

    for (const destination of allDestinations) {
      this.sendSubscribeFrame(destination);
    }
  }

  private sendSubscribeFrame(destination: string): void {
    if (!this.isConnected) return;
    const subId = `sub-${this.subIdCounter++}`;
    this.activeSubscriptions.set(destination, subId);
    this.sendFrame('SUBSCRIBE', { id: subId, destination });
  }

  public subscribeToChat(
    chatId: number,
    onMessage: MessageCallback,
    onReadReceipt?: ReadReceiptCallback
  ): () => void {
    const messageDest = `/topic/chat/${chatId}`;
    const readDest = `/topic/chat/${chatId}/read`;

    // Registra callback de mensagem
    if (!this.messageCallbacks.has(messageDest)) {
      this.messageCallbacks.set(messageDest, new Set());
    }
    this.messageCallbacks.get(messageDest)!.add(onMessage);

    // Registra callback de leitura
    if (onReadReceipt) {
      if (!this.readCallbacks.has(readDest)) {
        this.readCallbacks.set(readDest, new Set());
      }
      this.readCallbacks.get(readDest)!.add(onReadReceipt);
    }

    if (this.isConnected) {
      this.sendSubscribeFrame(messageDest);
      if (onReadReceipt) this.sendSubscribeFrame(readDest);
    } else {
      this.connect();
    }

    // Retorna função para cancelar inscrição
    return () => {
      this.messageCallbacks.get(messageDest)?.delete(onMessage);
      if (this.messageCallbacks.get(messageDest)?.size === 0) {
        this.messageCallbacks.delete(messageDest);
      }

      if (onReadReceipt) {
        this.readCallbacks.get(readDest)?.delete(onReadReceipt);
        if (this.readCallbacks.get(readDest)?.size === 0) {
          this.readCallbacks.delete(readDest);
        }
      }
    };
  }

  public onConnectionStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.isConnected);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  private notifyStatus(connected: boolean): void {
    this.statusCallbacks.forEach((cb) => cb(connected));
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.activeSubscriptions.clear();
  }
}

export const chatSocket = new ChatSocketService();
export default chatSocket;

