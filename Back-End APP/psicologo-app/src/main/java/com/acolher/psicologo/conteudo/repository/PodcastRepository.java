package com.acolher.psicologo.conteudo.repository;

import com.acolher.psicologo.conteudo.entity.Podcast;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PodcastRepository extends JpaRepository<Podcast, Integer> {

    List<Podcast> findAllByOrderByCriadoEmDesc();

    List<Podcast> findByAutorIdOrderByCriadoEmDesc(Integer autorId);

    List<Podcast> findByCategoriaContainingIgnoreCaseOrderByCriadoEmDesc(String categoria);
}

