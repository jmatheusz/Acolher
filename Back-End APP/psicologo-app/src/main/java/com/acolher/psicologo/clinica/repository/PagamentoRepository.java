package com.acolher.psicologo.clinica.repository;

import com.acolher.psicologo.clinica.entity.Pagamento;
import com.acolher.psicologo.clinica.entity.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {

    List<Pagamento> findByPsicologoIdOrderByDataVencimentoDesc(Integer psicologoId);

    List<Pagamento> findByPsicologoIdAndDataVencimentoBetweenOrderByDataVencimentoDesc(
            Integer psicologoId, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(p.valor), 0) FROM Pagamento p WHERE p.psicologo.id = :psicologoId AND p.status = :status")
    BigDecimal somarPorStatus(@Param("psicologoId") Integer psicologoId, @Param("status") StatusPagamento status);
}

