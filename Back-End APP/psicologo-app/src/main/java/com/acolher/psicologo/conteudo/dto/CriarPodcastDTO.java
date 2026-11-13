package com.acolher.psicologo.conteudo.dto;

import jakarta.validation.constraints.NotBlank;

public record CriarPodcastDTO(
        @NotBlank(message = "Informe o título do podcast")
        String titulo,
        String descricao,
        @NotBlank(message = "Informe a URL do áudio")
        String urlAudio,
        Integer duracaoSegundos,
        String categoria,
        String imagemCapa
) {}

