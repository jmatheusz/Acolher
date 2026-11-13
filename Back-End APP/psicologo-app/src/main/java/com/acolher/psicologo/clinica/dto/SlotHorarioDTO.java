package com.acolher.psicologo.clinica.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SlotHorarioDTO(
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        boolean disponivel
) {}

