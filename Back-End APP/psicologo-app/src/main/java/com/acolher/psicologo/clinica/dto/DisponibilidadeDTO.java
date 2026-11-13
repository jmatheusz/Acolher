package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.Disponibilidade;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record DisponibilidadeDTO(
        Integer id,
        @NotNull(message = "Informe o dia da semana")
        @Min(1) @Max(7)
        Integer diaSemana,
        @NotNull(message = "Informe o horário de início")
        LocalTime horaInicio,
        @NotNull(message = "Informe o horário de fim")
        LocalTime horaFim,
        Integer duracaoMinutos,
        Integer intervaloMinutos,
        Boolean ativo
) {
    public static DisponibilidadeDTO de(Disponibilidade d) {
        return new DisponibilidadeDTO(
                d.getId(),
                d.getDiaSemana(),
                d.getHoraInicio(),
                d.getHoraFim(),
                d.getDuracaoMinutos(),
                d.getIntervaloMinutos(),
                d.getAtivo()
        );
    }
}

