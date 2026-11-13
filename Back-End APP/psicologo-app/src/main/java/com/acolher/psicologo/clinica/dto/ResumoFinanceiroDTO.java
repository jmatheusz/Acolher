package com.acolher.psicologo.clinica.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumoFinanceiroDTO(
        BigDecimal totalRecebido,
        BigDecimal totalAReceber,
        BigDecimal totalGeral,
        long quantidadeLancamentos,
        List<PagamentoDTO> lancamentos
) {}

