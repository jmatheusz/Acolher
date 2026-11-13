package com.acolher.psicologo.chat.entity;

import com.acolher.psicologo.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "Mensagem")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_id", nullable = false)
    private Usuario remetente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_midia", nullable = false)
    private TipoMidia tipoMidia;

    @Column(name = "conteudo_texto", length = 5000)
    private String conteudoTexto;

    @Column(name = "enviada_em", nullable = false)
    private LocalDateTime enviadaEm;

    @Column(nullable = false)
    private Boolean excluida;

    @Column(name = "ultima_leitura")
    private LocalDateTime ultimaLeitura;

    public Mensagem(Chat chat, Usuario remetente, String conteudoTexto, TipoMidia tipoMidia) {
        this.chat = chat;
        this.remetente = remetente;
        this.conteudoTexto = conteudoTexto;
        this.tipoMidia = tipoMidia != null ? tipoMidia : TipoMidia.texto;
        this.enviadaEm = LocalDateTime.now();
        this.excluida = false;
        this.ultimaLeitura = null;
    }

    public boolean isLida() {
        return ultimaLeitura != null;
    }

    public void marcarComoLida(LocalDateTime momento) {
        if (this.ultimaLeitura == null) {
            this.ultimaLeitura = momento != null ? momento : LocalDateTime.now();
        }
    }

    public void excluir() {
        this.excluida = true;
    }
}

