import { useCallback, useEffect, useRef, useState } from "react";
import { buscarMensagens, enviarMensagem, marcarComoLidas } from "../services/chat";
import chatSocket from "../services/chatSocket";
import { getIdUsuarioLogado } from "../services/perfil";
import { MessageResponse } from "../types/chat";

export function useChat(chatId: number) {
  const [mensagens, setMensagens] = useState<MessageResponse[]>([]);
  const [meuId, setMeuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conectado, setConectado] = useState(false);

  const pollingRef = useRef<any>(null);

  // Função auxiliar para deduplicar mensagens por ID
  const deduplicar = (lista: MessageResponse[]): MessageResponse[] => {
    const mapa = new Map<number, MessageResponse>();
    for (const item of lista) {
      if (item && item.id) {
        mapa.set(item.id, item);
      }
    }
    return Array.from(mapa.values()).sort((a, b) => {
      const tA = new Date(a.enviadaEm || 0).getTime();
      const tB = new Date(b.enviadaEm || 0).getTime();
      return tA - tB;
    });
  };

  const carregarHistorico = useCallback(async () => {
    if (!chatId) return;
    try {
      const [historico, idLogado] = await Promise.all([
        buscarMensagens(chatId),
        getIdUsuarioLogado(),
      ]);

      setMeuId(idLogado);
      setMensagens(deduplicar(historico));

      // Marca mensagens recebidas como lidas
      marcarComoLidas(chatId).catch(() => {});
    } catch (err) {
      console.warn("[useChat] Erro ao carregar histórico:", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    carregarHistorico();

    // 1. Inscrição em tempo real no canal do chat via STOMP WebSocket
    const unsubscribeSocket = chatSocket.subscribeToChat(
      chatId,
      (novaMensagem: MessageResponse) => {
        setMensagens((atuais) => {
          // Substitui mensagem otimista temporária ou adiciona a nova sem duplicar
          const semOtimista = atuais.filter(
            (m) => !(m.pendente && m.conteudoTexto === novaMensagem.conteudoTexto)
          );
          return deduplicar([...semOtimista, novaMensagem]);
        });

        // Se a mensagem foi enviada pelo outro participante, marca como lida
        if (meuId !== null && Number(novaMensagem.remetenteId) !== Number(meuId)) {
          marcarComoLidas(chatId).catch(() => {});
        }
      },
      (receipt) => {
        // Confirmação de leitura em tempo real
        setMensagens((atuais) =>
          atuais.map((m) =>
            meuId !== null && Number(m.remetenteId) === Number(meuId)
              ? { ...m, lida: true }
              : m
          )
        );
      }
    );

    // 2. Monitoramento do status de conexão do WebSocket
    const unsubscribeStatus = chatSocket.onConnectionStatus((status) => {
      setConectado(status);
    });

    // 3. Fallback de polling suave a cada 5s apenas se o WebSocket estiver desconectado
    pollingRef.current = setInterval(() => {
      if (!conectado && chatId) {
        buscarMensagens(chatId)
          .then((novas) => {
            setMensagens((atuais) => {
              if (novas.length !== atuais.length) {
                return deduplicar(novas);
              }
              return atuais;
            });
          })
          .catch(() => {});
      }
    }, 5000);

    return () => {
      unsubscribeSocket();
      unsubscribeStatus();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [chatId, carregarHistorico, meuId, conectado]);

  const enviar = async (conteudoTexto: string): Promise<boolean> => {
    const textoLimpo = conteudoTexto.trim();
    if (!textoLimpo || enviando || !chatId) return false;

    setEnviando(true);

    // Inserção otimista local com ID temporário
    const idTemp = Date.now();
    const mensagemOtimista: MessageResponse = {
      id: idTemp,
      chatId,
      remetenteId: meuId || 0,
      remetenteNome: "Você",
      conteudoTexto: textoLimpo,
      tipoMidia: "texto",
      enviadaEm: new Date().toISOString(),
      lida: false,
      ultimaLeitura: null,
      pendente: true,
    };

    setMensagens((atuais) => [...atuais, mensagemOtimista]);

    try {
      const confirmada = await enviarMensagem(chatId, textoLimpo);
      // Substitui a mensagem temporária pela resposta confirmada do backend
      setMensagens((atuais) =>
        deduplicar(atuais.map((m) => (m.id === idTemp ? confirmada : m)))
      );
      return true;
    } catch (error) {
      console.error("[useChat] Erro ao enviar mensagem:", error);
      // Marca a mensagem otimista com erro ou a remove
      setMensagens((atuais) => atuais.filter((m) => m.id !== idTemp));
      throw error;
    } finally {
      setEnviando(false);
    }
  };

  return {
    mensagens,
    meuId,
    loading,
    enviando,
    conectado,
    enviar,
    recarregar: carregarHistorico,
  };
}

