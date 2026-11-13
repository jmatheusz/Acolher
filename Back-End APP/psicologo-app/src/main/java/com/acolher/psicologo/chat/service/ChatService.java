package com.acolher.psicologo.chat.service;

import com.acolher.psicologo.chat.dto.ChatResponseDTO;
import com.acolher.psicologo.chat.dto.ChatSummaryDTO;
import com.acolher.psicologo.chat.dto.CriarChatRequestDTO;
import com.acolher.psicologo.chat.entity.Chat;
import com.acolher.psicologo.chat.entity.Mensagem;
import com.acolher.psicologo.chat.entity.PrioridadeChat;
import com.acolher.psicologo.chat.entity.StatusChat;
import com.acolher.psicologo.chat.exception.AcessoNegadoChatException;
import com.acolher.psicologo.chat.repository.ChatRepository;
import com.acolher.psicologo.chat.repository.MensagemRepository;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public ChatResponseDTO iniciarOuRecuperarChat(String emailAutenticado, CriarChatRequestDTO dto) {
        Usuario solicitante = carregarUsuario(emailAutenticado);
        Usuario paciente;
        Usuario especialista;

        if (solicitante.getTipo() == TipoUsuario.especialista) {
            especialista = solicitante;
            Integer pacienteId = dto.usuarioId() != null ? dto.usuarioId() : dto.especialistaId();
            paciente = carregarUsuarioPorId(pacienteId);
        } else {
            paciente = solicitante;
            especialista = carregarUsuarioPorId(dto.especialistaId());
        }

        // Verifica se já existe um chat aberto ou em atendimento entre ambos
        Optional<Chat> chatAberto = chatRepository.buscarAbertoEntre(paciente.getId(), especialista.getId(), StatusChat.aberto);
        if (chatAberto.isPresent()) {
            return ChatResponseDTO.de(chatAberto.get());
        }

        Optional<Chat> chatEmAtendimento = chatRepository.buscarAbertoEntre(paciente.getId(), especialista.getId(), StatusChat.em_atendimento);
        if (chatEmAtendimento.isPresent()) {
            return ChatResponseDTO.de(chatEmAtendimento.get());
        }

        // Caso contrário cria novo chat
        PrioridadeChat prioridade = parsePrioridade(dto.prioridade());
        Chat novoChat = new Chat(paciente, especialista, StatusChat.aberto, prioridade);
        Chat salvo = chatRepository.save(novoChat);
        return ChatResponseDTO.de(salvo);
    }

    @Transactional(readOnly = true)
    public List<ChatSummaryDTO> listarConversas(String emailAutenticado) {
        Usuario usuario = carregarUsuario(emailAutenticado);
        List<Chat> chats = chatRepository.listarPorUsuario(usuario.getId());

        List<ChatSummaryDTO> resumos = new ArrayList<>();
        for (Chat c : chats) {
            Usuario outro = c.getOutroParticipante(usuario.getId());
            Optional<Mensagem> ultimaMsgOpt = mensagemRepository.findFirstByChatIdAndExcluidaFalseOrderByEnviadaEmDesc(c.getId());
            long naoLidas = mensagemRepository.countByChatIdAndRemetenteIdNotAndUltimaLeituraIsNullAndExcluidaFalse(c.getId(), usuario.getId());

            String ultimaTexto = ultimaMsgOpt.map(Mensagem::getConteudoTexto).orElse(null);
            LocalDateTime ultimaData = ultimaMsgOpt.map(Mensagem::getEnviadaEm).orElse(null);

            String fotoOutro = outro != null ? (outro.getFotoPerfil() != null ? outro.getFotoPerfil() : outro.getImagemAvatar()) : null;

            resumos.add(new ChatSummaryDTO(
                    c.getId(),
                    outro != null ? outro.getId() : null,
                    outro != null ? outro.getNomeCompleto() : "Desconhecido",
                    fotoOutro,
                    outro != null ? outro.getTipo().name() : null,
                    ultimaTexto,
                    ultimaData,
                    naoLidas,
                    c.getStatus() != null ? c.getStatus().name() : "aberto",
                    c.getPrioridade() != null ? c.getPrioridade().name() : "baixa",
                    c.getEntrouEm()
            ));
        }

        // Ordena pela mensagem mais recente ou criação
        resumos.sort(Comparator.comparing(
                (ChatSummaryDTO r) -> r.ultimaMensagemHorario() != null ? r.ultimaMensagemHorario() : r.criadoEm(),
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return resumos;
    }

    @Transactional(readOnly = true)
    public ChatResponseDTO buscarPorId(String emailAutenticado, Integer chatId) {
        Usuario usuario = carregarUsuario(emailAutenticado);
        Chat chat = carregarChatEValidarAcesso(usuario, chatId);
        return ChatResponseDTO.de(chat);
    }

    @Transactional
    public Chat carregarChatEValidarAcesso(Usuario usuario, Integer chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chat"));

        if (!chat.participa(usuario.getId())) {
            throw new AcessoNegadoChatException("Você não tem permissão para acessar esta conversa.");
        }

        return chat;
    }

    public Usuario carregarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário"));
    }

    public Usuario carregarUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário com ID " + id));
    }

    private PrioridadeChat parsePrioridade(String prioridade) {
        if (prioridade == null || prioridade.isBlank()) {
            return PrioridadeChat.baixa;
        }
        try {
            return PrioridadeChat.valueOf(prioridade.toLowerCase().trim());
        } catch (IllegalArgumentException e) {
            return PrioridadeChat.baixa;
        }
    }
}

