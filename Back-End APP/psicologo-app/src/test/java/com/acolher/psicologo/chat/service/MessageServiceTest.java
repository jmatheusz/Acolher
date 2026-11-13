package com.acolher.psicologo.chat.service;

import com.acolher.psicologo.chat.dto.MessageRequestDTO;
import com.acolher.psicologo.chat.dto.MessageResponseDTO;
import com.acolher.psicologo.chat.entity.Chat;
import com.acolher.psicologo.chat.entity.Mensagem;
import com.acolher.psicologo.chat.entity.PrioridadeChat;
import com.acolher.psicologo.chat.entity.StatusChat;
import com.acolher.psicologo.chat.entity.TipoMidia;
import com.acolher.psicologo.chat.exception.AcessoNegadoChatException;
import com.acolher.psicologo.chat.repository.MensagemRepository;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MensagemRepository mensagemRepository;

    @Mock
    private ChatService chatService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageService messageService;

    private Usuario paciente;
    private Usuario especialista;
    private Chat chat;

    @BeforeEach
    void setUp() {
        paciente = Usuario.novo("Lucas Paciente", "lucas@email.com", "senha123", TipoUsuario.usuario, false);
        ReflectionTestUtils.setField(paciente, "id", 1);

        especialista = Usuario.novo("Dra. Paula", "paula@email.com", "senha123", TipoUsuario.especialista, false);
        ReflectionTestUtils.setField(especialista, "id", 2);

        chat = new Chat(paciente, especialista, StatusChat.aberto, PrioridadeChat.baixa);
        ReflectionTestUtils.setField(chat, "id", 50);
    }

    @Test
    @DisplayName("Deve persistir mensagem no banco e propagar via WebSocket")
    void enviarMensagem_comSucesso_devePersistirENotificar() {
        MessageRequestDTO dto = new MessageRequestDTO("Olá, preciso de ajuda com agendamento", "texto");

        when(chatService.carregarUsuario("lucas@email.com")).thenReturn(paciente);
        when(chatService.carregarChatEValidarAcesso(paciente, 50)).thenReturn(chat);

        Mensagem msgSalva = new Mensagem(chat, paciente, "Olá, preciso de ajuda com agendamento", TipoMidia.texto);
        ReflectionTestUtils.setField(msgSalva, "id", 200);
        when(mensagemRepository.save(any(Mensagem.class))).thenReturn(msgSalva);

        MessageResponseDTO resposta = messageService.enviarMensagem("lucas@email.com", 50, dto);

        assertNotNull(resposta);
        assertEquals(200, resposta.id());
        assertEquals("Olá, preciso de ajuda com agendamento", resposta.conteudoTexto());
        assertTrue(resposta.me());

        verify(mensagemRepository, times(1)).save(any(Mensagem.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chat/50"), any(MessageResponseDTO.class));
        verify(messagingTemplate, times(1)).convertAndSendToUser(eq("paula@email.com"), eq("/queue/messages"), any(MessageResponseDTO.class));
    }

    @Test
    @DisplayName("Deve lançar AcessoNegadoChatException ao tentar enviar mensagem em conversa não autorizada")
    void enviarMensagem_quandoAcessoNegado_deveLancarExcecao() {
        MessageRequestDTO dto = new MessageRequestDTO("Mensagem indevida", "texto");

        when(chatService.carregarUsuario("lucas@email.com")).thenReturn(paciente);
        when(chatService.carregarChatEValidarAcesso(paciente, 50)).thenThrow(new AcessoNegadoChatException());

        assertThrows(AcessoNegadoChatException.class, () -> {
            messageService.enviarMensagem("lucas@email.com", 50, dto);
        });

        verify(mensagemRepository, never()).save(any(Mensagem.class));
    }

    @Test
    @DisplayName("Deve buscar histórico de mensagens ordenado cronologicamente")
    void buscarHistoricoCompleto_deveRetornarMensagensOrdenadas() {
        Mensagem m1 = new Mensagem(chat, paciente, "Primeira mensagem", TipoMidia.texto);
        ReflectionTestUtils.setField(m1, "id", 1);
        Mensagem m2 = new Mensagem(chat, especialista, "Segunda mensagem", TipoMidia.texto);
        ReflectionTestUtils.setField(m2, "id", 2);

        when(chatService.carregarUsuario("lucas@email.com")).thenReturn(paciente);
        when(chatService.carregarChatEValidarAcesso(paciente, 50)).thenReturn(chat);
        when(mensagemRepository.findByChatIdAndExcluidaFalseOrderByEnviadaEmAsc(50)).thenReturn(List.of(m1, m2));

        List<MessageResponseDTO> mensagens = messageService.buscarHistoricoCompleto("lucas@email.com", 50);

        assertEquals(2, mensagens.size());
        assertEquals("Primeira mensagem", mensagens.get(0).conteudoTexto());
        assertTrue(mensagens.get(0).me());
        assertEquals("Segunda mensagem", mensagens.get(1).conteudoTexto());
        assertFalse(mensagens.get(1).me());
    }

    @Test
    @DisplayName("Deve marcar mensagens recebidas como lidas e notificar via WebSocket")
    void marcarComoLidas_deveAtualizarENotificar() {
        when(chatService.carregarUsuario("lucas@email.com")).thenReturn(paciente);
        when(chatService.carregarChatEValidarAcesso(paciente, 50)).thenReturn(chat);
        when(mensagemRepository.marcarMensagensComoLidas(eq(50), eq(1), any(LocalDateTime.class))).thenReturn(3);

        int totalLidas = messageService.marcarComoLidas("lucas@email.com", 50);

        assertEquals(3, totalLidas);
        verify(mensagemRepository, times(1)).marcarMensagensComoLidas(eq(50), eq(1), any(LocalDateTime.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chat/50/read"), any(Object.class));
    }
}

