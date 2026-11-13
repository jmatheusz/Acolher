package com.acolher.psicologo.clinica.repository;

import com.acolher.psicologo.clinica.entity.Comparecimento;
import com.acolher.psicologo.clinica.entity.Consulta;
import com.acolher.psicologo.clinica.entity.StatusConsulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {

    List<Consulta> findByPsicologoIdAndDataConsultaOrderByHoraInicioAsc(Integer psicologoId, LocalDate data);

    List<Consulta> findByPsicologoIdAndDataConsultaBetweenOrderByDataConsultaAscHoraInicioAsc(
            Integer psicologoId, LocalDate inicio, LocalDate fim);

    List<Consulta> findByPacienteIdOrderByDataConsultaDescHoraInicioDesc(Integer pacienteId);

    @Query("SELECT c FROM Consulta c WHERE c.psicologo.id = :psicologoId AND c.status <> 'CANCELADA' " +
           "AND c.dataConsulta = :data AND (" +
           "(:inicio < c.horaFim AND :fim > c.horaInicio)" +
           ")")
    List<Consulta> buscarConflitos(
            @Param("psicologoId") Integer psicologoId,
            @Param("data") LocalDate data,
            @Param("inicio") LocalTime inicio,
            @Param("fim") LocalTime fim);

    long countByPsicologoIdAndDataConsulta(Integer psicologoId, LocalDate data);

    @Query("SELECT COUNT(DISTINCT c.paciente.id) FROM Consulta c WHERE c.psicologo.id = :psicologoId")
    long contarPacientesUnicosDoPsicologo(@Param("psicologoId") Integer psicologoId);

    long countByPsicologoIdAndCompareceu(Integer psicologoId, Comparecimento compareceu);

    long countByPsicologoIdAndStatus(Integer psicologoId, StatusConsulta status);

    @Query("SELECT DISTINCT c.paciente FROM Consulta c WHERE c.psicologo.id = :psicologoId")
    List<com.acolher.psicologo.usuario.Usuario> listarPacientesDoPsicologo(@Param("psicologoId") Integer psicologoId);
}

