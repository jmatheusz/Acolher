package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.FormaPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CriarPagamentoDTO(
        @NotNull(message = "Informe o paciente")
        Integer pacienteId,
        Integer consultaId,
        @NotNull(message = "Informe o valor da consulta")
        @Positive(message = "O valor deve ser maior que zero")
        BigDecimal valor,
        @NotNull(message = "Informe a data de vencimento")
        LocalDate dataVencimento,
        FormaPagamento formaPagamento,
        String descricao
) {}

