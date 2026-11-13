package com.acolher.psicologo.chat.controller;

import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;

    @MessageMapping("/chat/{chatId}/send")
    public MessageResponseDTO enviarMensagem(
            @DestinationVariable Integer chatId,
            @Payload @Valid MessageRequestDTO dto,
            Principal principal) {
        if (principal == null) {
            log.warn("Tentativa de envio de mensagem WebSocket sem usuário autenticado no chat {}", chatId);
            throw new IllegalStateException("Usuário não autenticado no WebSocket");
        }
        return messageService.enviarMensagem(principal.getName(), chatId, dto);
    }

    @MessageMapping("/chat/{chatId}/read")
    public void marcarComoLidas(
            @DestinationVariable Integer chatId,
            Principal principal) {
        if (principal != null) {
            messageService.marcarComoLidas(principal.getName(), chatId);
        }
    }
}

