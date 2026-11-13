package com.acolher.psicologo.conteudo.entity;

import com.acolher.psicologo.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Artigo")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Artigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(length = 500)
    private String resumo;

    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String corpo;

    @Column(nullable = false, length = 100)
    private String categoria = "Saúde Mental";

    @Column(name = "imagem_capa", length = 500)
    private String imagemCapa;

    @Column(nullable = false, length = 20)
    private String status = "PUBLICADO";

    @Column(name = "publicado_em", nullable = false)
    private LocalDateTime publicadoEm = LocalDateTime.now();

    public Artigo(Usuario autor, String titulo, String resumo, String corpo,
                  String categoria, String imagemCapa, String status) {
        this.autor = autor;
        this.titulo = titulo;
        this.resumo = resumo;
        this.corpo = corpo;
        this.categoria = categoria != null ? categoria : "Saúde Mental";
        this.imagemCapa = imagemCapa;
        this.status = status != null ? status : "PUBLICADO";
        this.publicadoEm = LocalDateTime.now();
    }
}

