package com.acolher.psicologo.conteudo.dto;

import jakarta.validation.constraints.NotBlank;

public record CriarArtigoDTO(
        @NotBlank(message = "Informe o título do artigo")
        String titulo,
        String resumo,
        @NotBlank(message = "O conteúdo do artigo é obrigatório")
        String corpo,
        String categoria,
        String imagemCapa,
        String status
) {}

