package com.acolher.psicologo.usuario;

import com.acolher.psicologo.shared.persistence.SimNaoConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nomeCompleto;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(name = "foto_perfil", length = 255)
    private String fotoPerfil;

    @Column(name = "imagem_avatar", length = 255)
    private String imagemAvatar;

    @Convert(converter = SimNaoConverter.class)
    @Column(name = "_anonimo", nullable = false)
    private Boolean anonimo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoUsuario tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConta status;

    private Usuario(String nomeCompleto, String email, String senhaCriptografada,
                    TipoUsuario tipo, boolean anonimo) {
        this.nomeCompleto = nomeCompleto;
        this.email = email;
        this.senha = senhaCriptografada;
        this.tipo = tipo;
        this.anonimo = anonimo;
        this.status = StatusConta.pendente;
    }

    public static Usuario novo(String nomeCompleto, String email, String senhaCriptografada,
                               TipoUsuario tipo, boolean anonimo) {
        return new Usuario(nomeCompleto, email, senhaCriptografada,
                tipo == null ? TipoUsuario.usuario : tipo, anonimo);
    }

    public void ativar() {
        this.status = StatusConta.ativo;
    }

    public void trocarSenha(String senhaCriptografada) {
        this.senha = senhaCriptografada;
    }

    public void atualizarPerfil(String nomeCompleto, String fotoPerfil, String imagemAvatar, Boolean anonimo) {
        if (nomeCompleto != null) {
            this.nomeCompleto = nomeCompleto;
        }
        if (fotoPerfil != null) {
            this.fotoPerfil = fotoPerfil;
        }
        if (imagemAvatar != null) {
            this.imagemAvatar = imagemAvatar;
        }
        if (anonimo != null) {
            this.anonimo = anonimo;
        }
    }

    public boolean aguardandoVerificacao() {
        return status == StatusConta.pendente;
    }
}
