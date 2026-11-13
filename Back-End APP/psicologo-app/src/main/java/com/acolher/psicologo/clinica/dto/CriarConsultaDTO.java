package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.ModalidadeConsulta;
import com.acolher.psicologo.clinica.entity.TipoConsulta;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CriarConsultaDTO(
        Integer psicologoId,
        Integer pacienteId,
        @NotNull(message = "Informe a data da consulta")
        LocalDate dataConsulta,
        @NotNull(message = "Informe o horário de início")
        LocalTime horaInicio,
        LocalTime horaFim,
        TipoConsulta tipo,
        ModalidadeConsulta modalidade,
        String observacoes
) {}

