package com.acolher.psicologo.especialista.dto;

import com.acolher.psicologo.especialista.entity.Especialidade;
import com.acolher.psicologo.usuario.Usuario;

import java.math.BigDecimal;

public record DadosEspecialistaDTO(
        Integer id,
        Integer usuarioId,
        String nomeCompleto,
        String fotoPerfil,
        String imagemAvatar,
        String codigoCrp,
        String credenciais,
        String especialidade,
        String biografia,
        Boolean disponivel,
        BigDecimal notaMedia
) {
    public static DadosEspecialistaDTO de(Especialidade esp) {
        Usuario u = esp.getUsuario();
        return new DadosEspecialistaDTO(
                esp.getId(),
                u != null ? u.getId() : null,
                esp.getNome() != null ? esp.getNome() : (u != null ? u.getNomeCompleto() : ""),
                u != null ? u.getFotoPerfil() : null,
                u != null ? u.getImagemAvatar() : null,
                esp.getCodigoCrp(),
                esp.getCredenciais(),
                esp.getEspecialidade(),
                esp.getBiografia(),
                esp.getDisponivel(),
                esp.getNotaMedia()
        );
    }

    public static DadosEspecialistaDTO deUsuarioEspecialista(Usuario u) {
        return new DadosEspecialistaDTO(
                u.getId(),
                u.getId(),
                u.getNomeCompleto(),
                u.getFotoPerfil(),
                u.getImagemAvatar(),
                null,
                null,
                "Psicólogo Clínico",
                null,
                true,
                BigDecimal.valueOf(5.0)
        );
    }
}

