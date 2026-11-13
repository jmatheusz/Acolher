package com.acolher.psicologo.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroConflitoDTO(
        String campo,
        String mensagem,
        String detail,
        int status,
        String title,
        Instant momento
) {
    public ErroConflitoDTO(String campo, String mensagem) {
        this(campo, mensagem, mensagem, 409, "Conflito", Instant.now());
    }
}

