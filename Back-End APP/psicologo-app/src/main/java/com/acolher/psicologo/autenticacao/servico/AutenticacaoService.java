package com.acolher.psicologo.autenticacao.servico;

import com.acolher.psicologo.autenticacao.dto.Credenciais;
import com.acolher.psicologo.autenticacao.dto.TokenDeAcesso;
import com.acolher.psicologo.seguranca.jwt.JwtService;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private final AuthenticationManager gerenciadorDeAutenticacao;
    private final UsuarioRepository repository;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public TokenDeAcesso autenticar(Credenciais credenciais) {
        String email = credenciais.email().trim().toLowerCase(Locale.ROOT);

        gerenciadorDeAutenticacao.authenticate(
                new UsernamePasswordAuthenticationToken(email, credenciais.senha()));

        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario"));

        JwtService.TokenEmitido emitido = jwtService.emitirPara(usuario);

        return TokenDeAcesso.bearer(emitido.valor(), emitido.expiraEm(), DadosUsuario.de(usuario));
    }
}
