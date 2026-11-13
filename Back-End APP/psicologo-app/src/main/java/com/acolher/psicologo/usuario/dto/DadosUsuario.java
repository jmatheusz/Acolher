package com.acolher.psicologo.usuario.dto;

import com.acolher.psicologo.usuario.StatusConta;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;

public record DadosUsuario(
        Integer id,
        String nomeCompleto,
        String email,
        String fotoPerfil,
        String imagemAvatar,
        Boolean anonimo,
        TipoUsuario tipo,
        StatusConta status) {

    public static DadosUsuario de(Usuario usuario) {
        return new DadosUsuario(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getFotoPerfil(),
                usuario.getImagemAvatar(),
                usuario.getAnonimo(),
                usuario.getTipo(),
                usuario.getStatus());
    }
}
