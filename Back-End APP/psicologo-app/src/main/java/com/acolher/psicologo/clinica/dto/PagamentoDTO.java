package com.acolher.psicologo.clinica.dto;

import com.acolher.psicologo.clinica.entity.FormaPagamento;
import com.acolher.psicologo.clinica.entity.Pagamento;
import com.acolher.psicologo.clinica.entity.StatusPagamento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PagamentoDTO(
        Integer id,
        Integer psicologoId,
        Integer pacienteId,
        String pacienteNome,
        Integer consultaId,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataPagamento,
        StatusPagamento status,
        FormaPagamento formaPagamento,
        String descricao,
        LocalDateTime criadoEm
) {
    public static PagamentoDTO de(Pagamento p) {
        return new PagamentoDTO(
                p.getId(),
                p.getPsicologo() != null ? p.getPsicologo().getId() : null,
                p.getPaciente() != null ? p.getPaciente().getId() : null,
                p.getPaciente() != null ? p.getPaciente().getNomeCompleto() : null,
                p.getConsulta() != null ? p.getConsulta().getId() : null,
                p.getValor(),
                p.getDataVencimento(),
                p.getDataPagamento(),
                p.getStatus(),
                p.getFormaPagamento(),
                p.getDescricao(),
                p.getCriadoEm()
        );
    }
}

