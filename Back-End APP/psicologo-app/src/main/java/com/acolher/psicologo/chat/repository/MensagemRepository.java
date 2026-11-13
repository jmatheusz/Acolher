package com.acolher.psicologo.chat.repository;

import com.acolher.psicologo.chat.entity.Mensagem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MensagemRepository extends JpaRepository<Mensagem, Integer> {

    Page<Mensagem> findByChatIdAndExcluidaFalseOrderByEnviadaEmDesc(Integer chatId, Pageable pageable);

    List<Mensagem> findByChatIdAndExcluidaFalseOrderByEnviadaEmAsc(Integer chatId);

    Optional<Mensagem> findFirstByChatIdAndExcluidaFalseOrderByEnviadaEmDesc(Integer chatId);

    long countByChatIdAndRemetenteIdNotAndUltimaLeituraIsNullAndExcluidaFalse(Integer chatId, Integer remetenteId);

    @Query("SELECT COUNT(m) FROM Mensagem m " +
           "WHERE (m.chat.usuario.id = :usuarioId OR m.chat.especialista.id = :usuarioId) " +
           "  AND m.remetente.id != :usuarioId " +
           "  AND m.ultimaLeitura IS NULL " +
           "  AND m.excluida = false")
    long contarNaoLidasTotalDoUsuario(@Param("usuarioId") Integer usuarioId);

    @Modifying
    @Query("UPDATE Mensagem m SET m.ultimaLeitura = :agora " +
           "WHERE m.chat.id = :chatId " +
           "  AND m.remetente.id != :usuarioId " +
           "  AND m.ultimaLeitura IS NULL " +
           "  AND m.excluida = false")
    int marcarMensagensComoLidas(@Param("chatId") Integer chatId,
                                @Param("usuarioId") Integer usuarioId,
                                @Param("agora") LocalDateTime agora);
}

