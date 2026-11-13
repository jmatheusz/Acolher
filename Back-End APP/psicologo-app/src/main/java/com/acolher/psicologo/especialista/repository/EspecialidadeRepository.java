package com.acolher.psicologo.especialista.repository;

import com.acolher.psicologo.especialista.entity.Especialidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EspecialidadeRepository extends JpaRepository<Especialidade, Integer> {

    List<Especialidade> findByDisponivelTrue();

    Optional<Especialidade> findByUsuarioId(Integer usuarioId);
}

