package com.acolher.psicologo.autenticacao.dto;

import com.acolher.psicologo.usuario.dto.DadosUsuario;

import java.time.Instant;

public record TokenDeAcesso(String token, String tipo, Instant expiraEm, DadosUsuario usuario) {

    public static TokenDeAcesso bearer(String token, Instant expiraEm, DadosUsuario usuario) {
        return new TokenDeAcesso(token, "Bearer", expiraEm, usuario);
    }
}
