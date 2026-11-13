package com.acolher.psicologo.conteudo.dto;

import com.acolher.psicologo.conteudo.entity.Podcast;

import java.time.LocalDateTime;

public record PodcastDTO(
        Integer id,
        Integer autorId,
        String autorNome,
        String titulo,
        String descricao,
        String urlAudio,
        Integer duracaoSegundos,
        String categoria,
        String imagemCapa,
        LocalDateTime criadoEm
) {
    public static PodcastDTO de(Podcast p) {
        return new PodcastDTO(
                p.getId(),
                p.getAutor() != null ? p.getAutor().getId() : null,
                p.getAutor() != null ? p.getAutor().getNomeCompleto() : null,
                p.getTitulo(),
                p.getDescricao(),
                p.getUrlAudio(),
                p.getDuracaoSegundos(),
                p.getCategoria(),
                p.getImagemCapa(),
                p.getCriadoEm()
        );
    }
}

