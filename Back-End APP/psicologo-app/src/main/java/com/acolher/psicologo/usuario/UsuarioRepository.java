package com.acolher.psicologo.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByTipo(TipoUsuario tipo);

    List<Usuario> findByTipoAndStatus(TipoUsuario tipo, StatusConta status);
}
