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
@Table(name = "Podcast")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Podcast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "url_audio", nullable = false, length = 500)
    private String urlAudio;

    @Column(name = "duracao_segundos", nullable = false)
    private Integer duracaoSegundos = 0;

    @Column(nullable = false, length = 100)
    private String categoria = "Acolhimento";

    @Column(name = "imagem_capa", length = 500)
    private String imagemCapa;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Podcast(Usuario autor, String titulo, String descricao, String urlAudio,
                   Integer duracaoSegundos, String categoria, String imagemCapa) {
        this.autor = autor;
        this.titulo = titulo;
        this.descricao = descricao;
        this.urlAudio = urlAudio;
        this.duracaoSegundos = duracaoSegundos != null ? duracaoSegundos : 0;
        this.categoria = categoria != null ? categoria : "Acolhimento";
        this.imagemCapa = imagemCapa;
        this.criadoEm = LocalDateTime.now();
    }
}

