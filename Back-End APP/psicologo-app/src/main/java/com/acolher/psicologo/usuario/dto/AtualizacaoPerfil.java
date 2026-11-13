package com.acolher.psicologo.usuario.dto;

import jakarta.validation.constraints.Size;

public record AtualizacaoPerfil(
        @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
        String nomeCompleto,

        @Size(max = 255, message = "URL da foto muito longa")
        String fotoPerfil,

        @Size(max = 255, message = "URL do avatar muito longa")
        String imagemAvatar,

        Boolean anonimo) {
}
