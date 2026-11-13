package com.acolher.psicologo.conteudo.repository;

import com.acolher.psicologo.conteudo.entity.Artigo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtigoRepository extends JpaRepository<Artigo, Integer> {

    List<Artigo> findByStatusOrderByPublicadoEmDesc(String status);

    List<Artigo> findByAutorIdOrderByPublicadoEmDesc(Integer autorId);

    List<Artigo> findByStatusAndCategoriaContainingIgnoreCaseOrderByPublicadoEmDesc(String status, String categoria);
}

