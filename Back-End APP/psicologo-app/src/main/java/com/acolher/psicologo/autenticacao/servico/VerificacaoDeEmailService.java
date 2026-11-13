package com.acolher.psicologo.autenticacao.servico;

import com.acolher.psicologo.autenticacao.dominio.AutenticacaoToken;
import com.acolher.psicologo.autenticacao.dominio.AutenticacaoTokenRepository;
import com.acolher.psicologo.autenticacao.dominio.TipoToken;
import com.acolher.psicologo.config.FrontendPropriedades;
import com.acolher.psicologo.config.VerificacaoPropriedades;
import com.acolher.psicologo.notificacao.EnviadorDeEmail;
import com.acolher.psicologo.shared.exception.TokenInvalidoException;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VerificacaoDeEmailService {

    private static final String ASSUNTO = "Confirme seu cadastro no Acolher";

    private final AutenticacaoTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final GeradorDeTokenOpaco gerador;
    private final EnviadorDeEmail enviador;
    private final VerificacaoPropriedades verificacao;
    private final FrontendPropriedades frontend;

    @Transactional
    public void enviarPara(Usuario usuario) {
        tokenRepository.deleteByUsuarioAndTipoAndUsadoEmIsNull(usuario, TipoToken.VERIFICACAO_EMAIL);

        String tokenBruto = gerador.gerar();
        LocalDateTime expiraEm = LocalDateTime.now().plus(verificacao.validade());

        tokenRepository.save(AutenticacaoToken.emitir(usuario, TipoToken.VERIFICACAO_EMAIL,
                gerador.resumir(tokenBruto), expiraEm));

        enviador.enviar(usuario.getEmail(), ASSUNTO, corpoDoEmail(usuario, tokenBruto));
    }

    @Transactional
    public void confirmar(String tokenBruto) {
        AutenticacaoToken token = tokenRepository
                .findByTokenAndTipo(gerador.resumir(tokenBruto), TipoToken.VERIFICACAO_EMAIL)
                .orElseThrow(() -> new TokenInvalidoException("Link de verificacao invalido"));

        if (!token.utilizavel()) {
            throw new TokenInvalidoException("Link de verificacao expirado ou ja utilizado");
        }

        token.marcarComoUsado();
        token.getUsuario().ativar();
    }

    @Transactional
    public void reenviar(String email) {
        usuarioRepository.findByEmail(email)
                .filter(Usuario::aguardandoVerificacao)
                .ifPresent(this::enviarPara);
    }

    private String corpoDoEmail(Usuario usuario, String tokenBruto) {
        String link = UriComponentsBuilder.fromUriString(frontend.url())
                .path(verificacao.rotaFrontend())
                .queryParam("token", tokenBruto)
                .build()
                .toUriString();

        return """
                Ola, %s!

                Para ativar sua conta no Acolher, acesse o link abaixo:

                %s

                O link expira em %d horas. Se voce nao criou esta conta, ignore este e-mail.
                """.formatted(usuario.getNomeCompleto(), link, verificacao.validade().toHours());
    }
}
