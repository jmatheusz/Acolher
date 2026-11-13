package com.acolher.psicologo.usuario;

import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.dto.AtualizacaoPerfil;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;

    @Transactional(readOnly = true)
    public DadosUsuario buscarPorEmail(String email) {
        return DadosUsuario.de(carregar(email));
    }

    @Transactional
    public DadosUsuario atualizarPerfil(String email, AtualizacaoPerfil dados) {
        Usuario usuario = carregar(email);
        usuario.atualizarPerfil(dados.nomeCompleto(), dados.fotoPerfil(),
                dados.imagemAvatar(), dados.anonimo());
        return DadosUsuario.de(usuario);
    }

    private Usuario carregar(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario"));
    }
}
