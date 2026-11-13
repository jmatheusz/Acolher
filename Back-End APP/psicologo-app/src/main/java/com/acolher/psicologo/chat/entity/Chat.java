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
@Table(name = "Chat")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialista_usuario_id", nullable = false)
    private Usuario especialista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusChat status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeChat prioridade;

    @Column(name = "entrou_em", nullable = false)
    private LocalDateTime entrouEm;

    @Column(name = "encerrado_em")
    private LocalDateTime encerradoEm;

    public Chat(Usuario usuario, Usuario especialista, StatusChat status, PrioridadeChat prioridade) {
        this.usuario = usuario;
        this.especialista = especialista;
        this.status = status != null ? status : StatusChat.aberto;
        this.prioridade = prioridade != null ? prioridade : PrioridadeChat.baixa;
        this.entrouEm = LocalDateTime.now();
    }

    public boolean participa(Integer usuarioId) {
        if (usuarioId == null) return false;
        return (usuario != null && usuarioId.equals(usuario.getId())) ||
               (especialista != null && usuarioId.equals(especialista.getId()));
    }

    public Usuario getOutroParticipante(Integer meuUsuarioId) {
        if (usuario != null && meuUsuarioId.equals(usuario.getId())) {
            return especialista;
        }
        return usuario;
    }

    public void encerrar() {
        this.status = StatusChat.encerrado;
        this.encerradoEm = LocalDateTime.now();
    }

    public void atualizarStatus(StatusChat novoStatus) {
        this.status = novoStatus;
        if (novoStatus == StatusChat.encerrado && this.encerradoEm == null) {
            this.encerradoEm = LocalDateTime.now();
        }
    }
}

