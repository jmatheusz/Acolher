package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.BloqueioAgenda;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BloqueioAgendaDTO(
        Integer id,
        @NotNull(message = "Informe a data de início do bloqueio")
        LocalDate dataInicio,
        @NotNull(message = "Informe a data final do bloqueio")
        LocalDate dataFim,
        String motivo
) {
    public static BloqueioAgendaDTO de(BloqueioAgenda b) {
        return new BloqueioAgendaDTO(
                b.getId(),
                b.getDataInicio(),
                b.getDataFim(),
                b.getMotivo()
        );
    }
}

