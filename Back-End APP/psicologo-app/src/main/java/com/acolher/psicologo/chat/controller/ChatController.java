package com.acolher.psicologo.chat.controller;

import com.acolher.psicologo.chat.dto.ChatResponseDTO;
import com.acolher.psicologo.chat.dto.ChatSummaryDTO;
import com.acolher.psicologo.chat.dto.CriarChatRequestDTO;
import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.service.ChatService;
import com.acolher.psicologo.chat.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Chat", description = "Operações de conversas e mensagens entre pacientes e psicólogos")
@RestController
@RequestMapping({"/api/chats", "/chats"})
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageService messageService;

    @Operation(summary = "Inicia ou recupera uma conversa entre paciente e especialista")
    @PostMapping
    public ResponseEntity<ChatResponseDTO> criarOuRecuperar(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarChatRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.iniciarOuRecuperarChat(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Lista todas as conversas do usuário autenticado com prévia e não lidas")
    @GetMapping
    public ResponseEntity<List<ChatSummaryDTO>> listarConversas(
            @AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(chatService.listarConversas(autenticado.getUsername()));
    }

    @Operation(summary = "Retorna os detalhes de uma conversa por ID")
    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponseDTO> buscarPorId(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer chatId) {
        return ResponseEntity.ok(chatService.buscarPorId(autenticado.getUsername(), chatId));
    }

    @Operation(summary = "Busca o histórico de mensagens de uma conversa com paginação")
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageResponseDTO>> buscarHistorico(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer chatId,
            @RequestParam(required = false, defaultValue = "false") boolean paginado,
            @PageableDefault(size = 50) Pageable pageable) {
        if (paginado) {
            Page<MessageResponseDTO> pagina = messageService.buscarHistoricoPaginado(autenticado.getUsername(), chatId, pageable);
            return ResponseEntity.ok(pagina.getContent());
        }
        return ResponseEntity.ok(messageService.buscarHistoricoCompleto(autenticado.getUsername(), chatId));
    }

    @Operation(summary = "Envia uma mensagem de texto na conversa (REST)")
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageResponseDTO> enviarMensagem(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer chatId,
            @RequestBody @Valid MessageRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.enviarMensagem(autenticado.getUsername(), chatId, dto));
    }

    @Operation(summary = "Marca todas as mensagens recebidas na conversa como lidas")
    @PatchMapping("/{chatId}/read")
    public ResponseEntity<Map<String, Object>> marcarComoLidas(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer chatId) {
        int alteradas = messageService.marcarComoLidas(autenticado.getUsername(), chatId);
        return ResponseEntity.ok(Map.of("chatId", chatId, "mensagensMarcadas", alteradas));
    }

    @Operation(summary = "Retorna a contagem total de mensagens não lidas do usuário autenticado")
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(
            @AuthenticationPrincipal UserDetails autenticado) {
        long total = messageService.contarNaoLidasTotal(autenticado.getUsername());
        return ResponseEntity.ok(Map.of("totalNaoLidas", total));
    }
}

