package com.acolher.psicologo.clinica.repository;

import com.acolher.psicologo.clinica.entity.Disponibilidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, Integer> {

    List<Disponibilidade> findByPsicologoIdOrderByDiaSemanaAscHoraInicioAsc(Integer psicologoId);

    List<Disponibilidade> findByPsicologoIdAndAtivoTrueOrderByDiaSemanaAscHoraInicioAsc(Integer psicologoId);

    List<Disponibilidade> findByPsicologoIdAndDiaSemanaAndAtivoTrue(Integer psicologoId, Integer diaSemana);
}

