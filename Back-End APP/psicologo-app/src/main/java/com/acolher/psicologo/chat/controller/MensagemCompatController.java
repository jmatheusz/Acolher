package com.acolher.psicologo.chat.controller;

import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Mensagens Legado", description = "Compatibilidade retroativa de endpoints de mensagens")
@RestController
@RequestMapping("/mensagens")
@RequiredArgsConstructor
public class MensagemCompatController {

    private final MessageService messageService;

    @Operation(summary = "Compatibilidade: Busca mensagens por ID do chat")
    @GetMapping("/por-chat/{chatId}")
    public ResponseEntity<List<MessageResponseDTO>> buscarPorChat(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer chatId) {
        return ResponseEntity.ok(messageService.buscarHistoricoCompleto(autenticado.getUsername(), chatId));
    }

    @Operation(summary = "Compatibilidade: Envia mensagem recebendo chatId no corpo")
    @PostMapping
    public ResponseEntity<MessageResponseDTO> enviarLegado(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody Map<String, Object> corpo) {
        Integer chatId = ((Number) corpo.get("chatId")).intValue();
        String texto = (String) corpo.get("conteudoTexto");
        String tipoMidia = (String) corpo.get("tipoMidia");

        MessageRequestDTO dto = new MessageRequestDTO(texto, tipoMidia);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.enviarMensagem(autenticado.getUsername(), chatId, dto));
    }
}

