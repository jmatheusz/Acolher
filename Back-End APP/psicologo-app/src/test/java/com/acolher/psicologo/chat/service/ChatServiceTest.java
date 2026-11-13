package com.acolher.psicologo.chat.service;

import com.acolher.psicologo.chat.dto.ChatResponseDTO;
import com.acolher.psicologo.chat.dto.ChatSummaryDTO;
import com.acolher.psicologo.chat.dto.CriarChatRequestDTO;
import com.acolher.psicologo.chat.entity.Chat;
import com.acolher.psicologo.chat.entity.Mensagem;
import com.acolher.psicologo.chat.entity.PrioridadeChat;
import com.acolher.psicologo.chat.entity.StatusChat;
import com.acolher.psicologo.chat.entity.TipoMidia;
import com.acolher.psicologo.chat.exception.AcessoNegadoChatException;
import com.acolher.psicologo.chat.repository.ChatRepository;
import com.acolher.psicologo.chat.repository.MensagemRepository;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MensagemRepository mensagemRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ChatService chatService;

    private Usuario paciente;
    private Usuario especialista;
    private Usuario terceiro;

    @BeforeEach
    void setUp() {
        paciente = Usuario.novo("João Paciente", "joao@email.com", "senha123", TipoUsuario.usuario, false);
        ReflectionTestUtils.setField(paciente, "id", 1);

        especialista = Usuario.novo("Dra. Maria", "maria@email.com", "senha123", TipoUsuario.especialista, false);
        ReflectionTestUtils.setField(especialista, "id", 2);

        terceiro = Usuario.novo("Carlos Terceiro", "carlos@email.com", "senha123", TipoUsuario.usuario, false);
        ReflectionTestUtils.setField(terceiro, "id", 3);
    }

    @Test
    @DisplayName("Deve criar um novo chat quando não existe conversa aberta prévia")
    void iniciarOuRecuperarChat_quandoNaoExiste_deveCriarNovo() {
        CriarChatRequestDTO dto = new CriarChatRequestDTO(2, null, "media");

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(paciente));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(especialista));
        when(chatRepository.buscarAbertoEntre(1, 2, StatusChat.aberto)).thenReturn(Optional.empty());
        when(chatRepository.buscarAbertoEntre(1, 2, StatusChat.em_atendimento)).thenReturn(Optional.empty());

        Chat chatSalvo = new Chat(paciente, especialista, StatusChat.aberto, PrioridadeChat.media);
        ReflectionTestUtils.setField(chatSalvo, "id", 10);
        when(chatRepository.save(any(Chat.class))).thenReturn(chatSalvo);

        ChatResponseDTO resposta = chatService.iniciarOuRecuperarChat("joao@email.com", dto);

        assertNotNull(resposta);
        assertEquals(10, resposta.id());
        assertEquals("João Paciente", resposta.usuarioNome());
        assertEquals("Dra. Maria", resposta.especialistaNome());
        verify(chatRepository, times(1)).save(any(Chat.class));
    }

    @Test
    @DisplayName("Deve recuperar chat existente sem duplicar quando já existe conversa aberta")
    void iniciarOuRecuperarChat_quandoJaExiste_deveRetornarExistente() {
        CriarChatRequestDTO dto = new CriarChatRequestDTO(2, null, "baixa");

        Chat chatExistente = new Chat(paciente, especialista, StatusChat.aberto, PrioridadeChat.baixa);
        ReflectionTestUtils.setField(chatExistente, "id", 15);

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(paciente));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(especialista));
        when(chatRepository.buscarAbertoEntre(1, 2, StatusChat.aberto)).thenReturn(Optional.of(chatExistente));

        ChatResponseDTO resposta = chatService.iniciarOuRecuperarChat("joao@email.com", dto);

        assertNotNull(resposta);
        assertEquals(15, resposta.id());
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    @DisplayName("Deve listar conversas com dados do outro participante e contagem de não lidas")
    void listarConversas_deveRetornarResumosOrdenados() {
        Chat chat = new Chat(paciente, especialista, StatusChat.aberto, PrioridadeChat.baixa);
        ReflectionTestUtils.setField(chat, "id", 20);

        Mensagem msg = new Mensagem(chat, especialista, "Olá João, tudo bem?", TipoMidia.texto);
        ReflectionTestUtils.setField(msg, "id", 100);

        when(usuarioRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(paciente));
        when(chatRepository.listarPorUsuario(1)).thenReturn(List.of(chat));
        when(mensagemRepository.findFirstByChatIdAndExcluidaFalseOrderByEnviadaEmDesc(20)).thenReturn(Optional.of(msg));
        when(mensagemRepository.countByChatIdAndRemetenteIdNotAndUltimaLeituraIsNullAndExcluidaFalse(20, 1)).thenReturn(1L);

        List<ChatSummaryDTO> conversas = chatService.listarConversas("joao@email.com");

        assertNotNull(conversas);
        assertEquals(1, conversas.size());
        ChatSummaryDTO resumo = conversas.get(0);
        assertEquals(20, resumo.id());
        assertEquals("Dra. Maria", resumo.outroParticipanteNome());
        assertEquals("Olá João, tudo bem?", resumo.ultimaMensagem());
        assertEquals(1L, resumo.mensagensNaoLidas());
    }

    @Test
    @DisplayName("Deve lançar AcessoNegadoChatException quando usuário tenta acessar chat de terceiro")
    void buscarPorId_quandoNaoEhParticipante_deveLancarExcecao() {
        Chat chat = new Chat(paciente, especialista, StatusChat.aberto, PrioridadeChat.baixa);
        ReflectionTestUtils.setField(chat, "id", 30);

        when(usuarioRepository.findByEmail("carlos@email.com")).thenReturn(Optional.of(terceiro));
        when(chatRepository.findById(30)).thenReturn(Optional.of(chat));

        assertThrows(AcessoNegadoChatException.class, () -> {
            chatService.buscarPorId("carlos@email.com", 30);
        });
    }
}

