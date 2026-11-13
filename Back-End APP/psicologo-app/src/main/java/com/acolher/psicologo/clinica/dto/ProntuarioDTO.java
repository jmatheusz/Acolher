package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.Prontuario;

import java.time.LocalDateTime;

public record ProntuarioDTO(
        Integer id,
        Integer psicologoId,
        Integer pacienteId,
        String pacienteNome,
        Integer consultaId,
        LocalDateTime dataRegistro,
        String titulo,
        String anotacoes,
        String evolucao,
        Boolean sigiloso
) {
    public static ProntuarioDTO de(Prontuario p) {
        return new ProntuarioDTO(
                p.getId(),
                p.getPsicologo() != null ? p.getPsicologo().getId() : null,
                p.getPaciente() != null ? p.getPaciente().getId() : null,
                p.getPaciente() != null ? p.getPaciente().getNomeCompleto() : null,
                p.getConsulta() != null ? p.getConsulta().getId() : null,
                p.getDataRegistro(),
                p.getTitulo(),
                p.getAnotacoes(),
                p.getEvolucao(),
                p.getSigiloso()
        );
    }
}

