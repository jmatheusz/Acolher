import api from './api';
import { ChatResponse, ChatSummary, Especialista, MessageResponse } from '../types/chat';

/**
 * Lista todas as conversas do usuário autenticado (paciente ou especialista).
 */
export async function listarConversas(): Promise<ChatSummary[]> {
  const response = await api.get<ChatSummary[]>('/api/chats');
  return response.data;
}

/**
 * Inicia ou recupera uma conversa aberta entre o usuário e o especialista.
 */
export async function criarOuRecuperarChat(
  especialistaId: number,
  usuarioId?: number,
  prioridade: string = 'media'
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>('/api/chats', {
    especialistaId,
    usuarioId,
    prioridade,
  });
  return response.data;
}

/**
 * Alias de compatibilidade com telas existentes.
 */
export async function criarChat(usuarioId: number, especialistaId: number): Promise<ChatResponse> {
  return criarOuRecuperarChat(especialistaId, usuarioId);
}

/**
 * Busca detalhes de uma conversa por ID.
 */
export async function buscarChatPorId(chatId: number): Promise<ChatResponse> {
  const response = await api.get<ChatResponse>(`/api/chats/${chatId}`);
  return response.data;
}

/**
 * Busca o histórico de mensagens da conversa.
 */
export async function buscarMensagens(chatId: number): Promise<MessageResponse[]> {
  const response = await api.get<MessageResponse[]>(`/api/chats/${chatId}/messages`);
  return response.data;
}

/**
 * Alias de compatibilidade para listar mensagens.
 */
export async function listarMensagensPorChat(chatId: number): Promise<MessageResponse[]> {
  return buscarMensagens(chatId);
}

/**
 * Envia uma nova mensagem na conversa.
 */
export async function enviarMensagem(
  chatId: number,
  conteudoTexto: string,
  tipoMidia: string = 'texto'
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(`/api/chats/${chatId}/messages`, {
    conteudoTexto,
    tipoMidia,
  });
  return response.data;
}

/**
 * Marca as mensagens recebidas na conversa como lidas.
 */
export async function marcarComoLidas(chatId: number): Promise<{ chatId: number; mensagensMarcadas: number }> {
  const response = await api.patch(`/api/chats/${chatId}/read`);
  return response.data;
}

/**
 * Retorna o número total de mensagens não lidas do usuário.
 */
export async function contarNaoLidasTotal(): Promise<number> {
  try {
    const response = await api.get<{ totalNaoLidas: number }>('/api/chats/unread-count');
    return response.data.totalNaoLidas || 0;
  } catch {
    return 0;
  }
}

/**
 * Lista todos os psicólogos/especialistas disponíveis.
 */
export async function listarEspecialistas(): Promise<Especialista[]> {
  const response = await api.get<Especialista[]>('/especialistas');
  return response.data;
}
