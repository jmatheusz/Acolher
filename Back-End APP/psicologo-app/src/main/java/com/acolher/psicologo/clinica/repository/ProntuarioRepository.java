package com.acolher.psicologo.clinica.repository;

import com.acolher.psicologo.clinica.entity.Prontuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Integer> {

    List<Prontuario> findByPsicologoIdOrderByDataRegistroDesc(Integer psicologoId);

    List<Prontuario> findByPsicologoIdAndPacienteIdOrderByDataRegistroDesc(Integer psicologoId, Integer pacienteId);

    Optional<Prontuario> findByIdAndPsicologoId(Integer id, Integer psicologoId);
}

