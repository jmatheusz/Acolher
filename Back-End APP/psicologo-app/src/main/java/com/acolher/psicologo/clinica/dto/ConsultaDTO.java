package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.Comparecimento;
import com.acolher.psicologo.clinica.entity.Consulta;
import com.acolher.psicologo.clinica.entity.ModalidadeConsulta;
import com.acolher.psicologo.clinica.entity.StatusConsulta;
import com.acolher.psicologo.clinica.entity.TipoConsulta;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ConsultaDTO(
        Integer id,
        Integer psicologoId,
        String psicologoNome,
        Integer pacienteId,
        String pacienteNome,
        String pacienteFoto,
        LocalDate dataConsulta,
        LocalTime horaInicio,
        LocalTime horaFim,
        TipoConsulta tipo,
        ModalidadeConsulta modalidade,
        StatusConsulta status,
        Comparecimento compareceu,
        String observacoes,
        String motivoCancelamento,
        LocalDateTime criadoEm
) {
    public static ConsultaDTO de(Consulta c) {
        return new ConsultaDTO(
                c.getId(),
                c.getPsicologo() != null ? c.getPsicologo().getId() : null,
                c.getPsicologo() != null ? c.getPsicologo().getNomeCompleto() : null,
                c.getPaciente() != null ? c.getPaciente().getId() : null,
                c.getPaciente() != null ? c.getPaciente().getNomeCompleto() : null,
                c.getPaciente() != null ? c.getPaciente().getFotoPerfil() : null,
                c.getDataConsulta(),
                c.getHoraInicio(),
                c.getHoraFim(),
                c.getTipo(),
                c.getModalidade(),
                c.getStatus(),
                c.getCompareceu(),
                c.getObservacoes(),
                c.getMotivoCancelamento(),
                c.getCriadoEm()
        );
    }
}

