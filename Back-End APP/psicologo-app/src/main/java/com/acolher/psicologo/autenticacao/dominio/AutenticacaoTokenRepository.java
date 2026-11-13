package com.acolher.psicologo.autenticacao.dominio;

import com.acolher.psicologo.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AutenticacaoTokenRepository extends JpaRepository<AutenticacaoToken, Integer> {

    Optional<AutenticacaoToken> findByTokenAndTipo(String token, TipoToken tipo);

    void deleteByUsuarioAndTipoAndUsadoEmIsNull(Usuario usuario, TipoToken tipo);
}
