package com.acolher.psicologo.chat.dto;

import com.acolher.psicologo.chat.entity.Chat;

import java.time.LocalDateTime;

public record ChatResponseDTO(
        Integer id,
        Integer usuarioId,
        String usuarioNome,
        String usuarioFoto,
        Integer especialistaId,
        String especialistaNome,
        String especialistaFoto,
        String status,
        String prioridade,
        LocalDateTime entrouEm,
        LocalDateTime encerradoEm
) {
    public static ChatResponseDTO de(Chat chat) {
        return new ChatResponseDTO(
                chat.getId(),
                chat.getUsuario() != null ? chat.getUsuario().getId() : null,
                chat.getUsuario() != null ? chat.getUsuario().getNomeCompleto() : null,
                chat.getUsuario() != null ? (chat.getUsuario().getFotoPerfil() != null ? chat.getUsuario().getFotoPerfil() : chat.getUsuario().getImagemAvatar()) : null,
                chat.getEspecialista() != null ? chat.getEspecialista().getId() : null,
                chat.getEspecialista() != null ? chat.getEspecialista().getNomeCompleto() : null,
                chat.getEspecialista() != null ? (chat.getEspecialista().getFotoPerfil() != null ? chat.getEspecialista().getFotoPerfil() : chat.getEspecialista().getImagemAvatar()) : null,
                chat.getStatus() != null ? chat.getStatus().name() : null,
                chat.getPrioridade() != null ? chat.getPrioridade().name() : null,
                chat.getEntrouEm(),
                chat.getEncerradoEm()
        );
    }
}

