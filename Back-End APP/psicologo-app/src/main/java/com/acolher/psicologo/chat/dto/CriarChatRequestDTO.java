package com.acolher.psicologo.chat.dto;

import jakarta.validation.constraints.NotNull;

public record CriarChatRequestDTO(
        @NotNull(message = "O ID do especialista ou participante é obrigatório")
        Integer especialistaId,
        Integer usuarioId,
        String prioridade
) {
}

