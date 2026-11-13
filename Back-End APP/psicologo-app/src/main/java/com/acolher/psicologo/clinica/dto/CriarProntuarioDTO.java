package com.acolher.psicologo.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CriarProntuarioDTO(
        @NotNull(message = "Informe o ID do paciente")
        Integer pacienteId,
        Integer consultaId,
        @NotBlank(message = "Informe o título do prontuário")
        String titulo,
        @NotBlank(message = "As anotações clínicas são obrigatórias")
        String anotacoes,
        String evolucao
) {}

