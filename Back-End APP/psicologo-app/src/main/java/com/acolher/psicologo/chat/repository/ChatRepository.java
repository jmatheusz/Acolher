package com.acolher.psicologo.chat.repository;

import com.acolher.psicologo.chat.entity.Chat;
import com.acolher.psicologo.chat.entity.StatusChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Integer> {

    @Query("SELECT c FROM Chat c WHERE (c.usuario.id = :usuarioId OR c.especialista.id = :usuarioId) ORDER BY c.entrouEm DESC")
    List<Chat> listarPorUsuario(@Param("usuarioId") Integer usuarioId);

    @Query("SELECT c FROM Chat c WHERE c.usuario.id = :usuarioId AND c.especialista.id = :especialistaId AND c.status = :status")
    Optional<Chat> buscarAbertoEntre(@Param("usuarioId") Integer usuarioId,
                                    @Param("especialistaId") Integer especialistaId,
                                    @Param("status") StatusChat status);

    @Query("SELECT c FROM Chat c WHERE c.usuario.id = :usuarioId AND c.especialista.id = :especialistaId ORDER BY c.entrouEm DESC")
    List<Chat> buscarTodosEntre(@Param("usuarioId") Integer usuarioId,
                                @Param("especialistaId") Integer especialistaId);
}

