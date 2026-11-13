package com.acolher.psicologo.clinica.repository;

import com.acolher.psicologo.clinica.entity.BloqueioAgenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BloqueioAgendaRepository extends JpaRepository<BloqueioAgenda, Integer> {

    List<BloqueioAgenda> findByPsicologoIdOrderByDataInicioAsc(Integer psicologoId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BloqueioAgenda b " +
           "WHERE b.psicologo.id = :psicologoId AND :data BETWEEN b.dataInicio AND b.dataFim")
    boolean dataEstaBloqueada(@Param("psicologoId") Integer psicologoId, @Param("data") LocalDate data);
}

