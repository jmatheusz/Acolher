package com.acolher.psicologo.conteudo.dto;

import com.acolher.psicologo.conteudo.entity.Artigo;

import java.time.LocalDateTime;

public record ArtigoDTO(
        Integer id,
        Integer autorId,
        String autorNome,
        String titulo,
        String resumo,
        String corpo,
        String categoria,
        String imagemCapa,
        String status,
        LocalDateTime publicadoEm
) {
    public static ArtigoDTO de(Artigo a) {
        return new ArtigoDTO(
                a.getId(),
                a.getAutor() != null ? a.getAutor().getId() : null,
                a.getAutor() != null ? a.getAutor().getNomeCompleto() : null,
                a.getTitulo(),
                a.getResumo(),
                a.getCorpo(),
                a.getCategoria(),
                a.getImagemCapa(),
                a.getStatus(),
                a.getPublicadoEm()
        );
    }
}

