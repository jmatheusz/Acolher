package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.usuario.Usuario;

import java.time.LocalDate;

public record PacienteResumoDTO(
        Integer id,
        String nomeCompleto,
        String email,
        String fotoPerfil,
        long totalConsultas,
        LocalDate ultimaConsulta
) {
    public static PacienteResumoDTO de(Usuario u, long totalConsultas, LocalDate ultimaConsulta) {
        return new PacienteResumoDTO(
                u.getId(),
                u.getNomeCompleto(),
                u.getEmail(),
                u.getFotoPerfil(),
                totalConsultas,
                ultimaConsulta
        );
    }
}

