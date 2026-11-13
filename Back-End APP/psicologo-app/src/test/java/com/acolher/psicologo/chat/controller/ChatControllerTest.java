package com.acolher.psicologo.chat.controller;

import com.acolher.psicologo.chat.dto.ChatResponseDTO;
import com.acolher.psicologo.chat.dto.ChatSummaryDTO;
import com.acolher.psicologo.chat.dto.CriarChatRequestDTO;
import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.service.ChatService;
import com.acolher.psicologo.chat.service.MessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private MessageService messageService;

    @Test
    @WithMockUser(username = "paciente@email.com", roles = "USUARIO")
    @DisplayName("POST /api/chats deve criar ou recuperar chat com sucesso")
    void criarOuRecuperarChat_deveRetornar201() throws Exception {
        CriarChatRequestDTO request = new CriarChatRequestDTO(2, null, "media");
        ChatResponseDTO response = new ChatResponseDTO(
                10, 1, "Paciente", null, 2, "Especialista", null, "aberto", "media", LocalDateTime.now(), null
        );

        when(chatService.iniciarOuRecuperarChat(eq("paciente@email.com"), any(CriarChatRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/chats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.usuarioNome").value("Paciente"))
                .andExpect(jsonPath("$.especialistaNome").value("Especialista"));
    }

    @Test
    @WithMockUser(username = "paciente@email.com", roles = "USUARIO")
    @DisplayName("GET /api/chats deve retornar lista de conversas do usuário autenticado")
    void listarConversas_deveRetornar200() throws Exception {
        ChatSummaryDTO summary = new ChatSummaryDTO(
                10, 2, "Dra. Maria", null, "especialista",
                "Olá paciente", LocalDateTime.now(), 1L, "aberto", "media", LocalDateTime.now()
        );

        when(chatService.listarConversas("paciente@email.com")).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/chats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].outroParticipanteNome").value("Dra. Maria"))
                .andExpect(jsonPath("$[0].mensagensNaoLidas").value(1));
    }

    @Test
    @WithMockUser(username = "paciente@email.com", roles = "USUARIO")
    @DisplayName("POST /api/chats/{chatId}/messages deve enviar mensagem com sucesso")
    void enviarMensagem_deveRetornar201() throws Exception {
        MessageRequestDTO request = new MessageRequestDTO("Tudo bem, obrigado!", "texto");
        MessageResponseDTO response = new MessageResponseDTO(
                100, 10, 1, "Paciente", "Tudo bem, obrigado!", "texto", LocalDateTime.now(), false, null, true
        );

        when(messageService.enviarMensagem(eq("paciente@email.com"), eq(10), any(MessageRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/chats/10/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.conteudoTexto").value("Tudo bem, obrigado!"))
                .andExpect(jsonPath("$.me").value(true));
    }

    @Test
    @WithMockUser(username = "paciente@email.com", roles = "USUARIO")
    @DisplayName("POST /api/chats/{chatId}/messages com mensagem em branco deve retornar 400 Bad Request")
    void enviarMensagem_comTextoEmBranco_deveRetornar400() throws Exception {
        MessageRequestDTO request = new MessageRequestDTO("   ", "texto");

        mockMvc.perform(post("/api/chats/10/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Acesso sem autenticação deve retornar 401 Unauthorized")
    void listarConversas_semAutenticacao_deveRetornar401() throws Exception {
        mockMvc.perform(get("/api/chats"))
                .andExpect(status().isUnauthorized());
    }
}

