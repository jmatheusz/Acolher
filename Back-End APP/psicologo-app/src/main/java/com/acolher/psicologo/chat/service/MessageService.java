package com.acolher.psicologo.chat.service;

import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.entity.Chat;
import com.acolher.psicologo.chat.entity.Mensagem;
import com.acolher.psicologo.chat.entity.TipoMidia;
import com.acolher.psicologo.chat.repository.MensagemRepository;
import com.acolher.psicologo.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MensagemRepository mensagemRepository;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponseDTO enviarMensagem(String emailAutenticado, Integer chatId, MessageRequestDTO dto) {
        Usuario remetente = chatService.carregarUsuario(emailAutenticado);
        Chat chat = chatService.carregarChatEValidarAcesso(remetente, chatId);

        TipoMidia tipoMidia = parseTipoMidia(dto.tipoMidia());
        Mensagem mensagem = new Mensagem(chat, remetente, dto.conteudoTexto().trim(), tipoMidia);
        Mensagem salva = mensagemRepository.save(mensagem);

        MessageResponseDTO broadcastDTO = MessageResponseDTO.de(salva, null);
        MessageResponseDTO responseDTO = MessageResponseDTO.de(salva, remetente.getId());

        // Envia em tempo real para o tópico da conversa sem atrelar 'me' estático
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, broadcastDTO);

            Usuario outro = chat.getOutroParticipante(remetente.getId());
            if (outro != null && outro.getEmail() != null) {
                messagingTemplate.convertAndSendToUser(outro.getEmail(), "/queue/messages", broadcastDTO);
            }
        } catch (Exception e) {
            log.warn("Falha ao propagar mensagem via WebSocket para o chat {}: {}", chatId, e.getMessage());
        }

        return responseDTO;
    }

    @Transactional(readOnly = true)
    public Page<MessageResponseDTO> buscarHistoricoPaginado(String emailAutenticado, Integer chatId, Pageable pageable) {
        Usuario usuario = chatService.carregarUsuario(emailAutenticado);
        chatService.carregarChatEValidarAcesso(usuario, chatId);

        return mensagemRepository.findByChatIdAndExcluidaFalseOrderByEnviadaEmDesc(chatId, pageable)
                .map(m -> MessageResponseDTO.de(m, usuario.getId()));
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDTO> buscarHistoricoCompleto(String emailAutenticado, Integer chatId) {
        Usuario usuario = chatService.carregarUsuario(emailAutenticado);
        chatService.carregarChatEValidarAcesso(usuario, chatId);

        List<Mensagem> mensagens = mensagemRepository.findByChatIdAndExcluidaFalseOrderByEnviadaEmAsc(chatId);
        return mensagens.stream()
                .map(m -> MessageResponseDTO.de(m, usuario.getId()))
                .toList();
    }

    @Transactional
    public int marcarComoLidas(String emailAutenticado, Integer chatId) {
        Usuario usuario = chatService.carregarUsuario(emailAutenticado);
        Chat chat = chatService.carregarChatEValidarAcesso(usuario, chatId);

        LocalDateTime agora = LocalDateTime.now();
        int atualizadas = mensagemRepository.marcarMensagensComoLidas(chat.getId(), usuario.getId(), agora);

        if (atualizadas > 0) {
            try {
                messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/read", Map.of(
                        "chatId", chatId,
                        "leitorId", usuario.getId(),
                        "momento", agora
                ));
            } catch (Exception e) {
                log.warn("Falha ao enviar confirmação de leitura via WebSocket: {}", e.getMessage());
            }
        }

        return atualizadas;
    }

    @Transactional(readOnly = true)
    public long contarNaoLidasTotal(String emailAutenticado) {
        Usuario usuario = chatService.carregarUsuario(emailAutenticado);
        return mensagemRepository.contarNaoLidasTotalDoUsuario(usuario.getId());
    }

    private TipoMidia parseTipoMidia(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return TipoMidia.texto;
        }
        try {
            return TipoMidia.valueOf(tipo.toLowerCase().trim());
        } catch (IllegalArgumentException e) {
            return TipoMidia.texto;
        }
    }
}

