package com.acolher.psicologo.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageRequestDTO(
        @NotBlank(message = "O conteúdo da mensagem não pode estar vazio")
        @Size(max = 5000, message = "A mensagem pode ter no máximo 5000 caracteres")
        String conteudoTexto,
        String tipoMidia
) {
}

