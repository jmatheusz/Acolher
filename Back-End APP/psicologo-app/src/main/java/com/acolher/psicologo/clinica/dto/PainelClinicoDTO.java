package com.acolher.psicologo.clinica.dto;

import java.math.BigDecimal;
import java.util.List;

public record PainelClinicoDTO(
        long sessoesHoje,
        long totalPacientes,
        double taxaPresenca,
        long totalPresencas,
        long totalFaltas,
        BigDecimal totalRecebido,
        BigDecimal totalAReceber,
        List<ConsultaDTO> agendaHoje
) {}

