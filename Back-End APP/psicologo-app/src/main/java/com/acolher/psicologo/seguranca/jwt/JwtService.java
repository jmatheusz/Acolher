package com.acolher.psicologo.seguranca.jwt;

import com.acolher.psicologo.config.JwtPropriedades;
import com.acolher.psicologo.usuario.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final JwtPropriedades propriedades;
    private final SecretKey chave;

    public JwtService(JwtPropriedades propriedades) {
        this.propriedades = propriedades;
        this.chave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(propriedades.secret()));
    }

    public TokenEmitido emitirPara(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(propriedades.expiracao());

        String valor = Jwts.builder()
                .issuer(propriedades.emissor())
                .subject(usuario.getEmail())
                .claim("uid", usuario.getId())
                .claim("tipo", usuario.getTipo().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiraEm))
                .signWith(chave)
                .compact();

        return new TokenEmitido(valor, expiraEm);
    }

    public Optional<String> extrairEmail(String token) {
        try {
            Claims conteudo = Jwts.parser()
                    .verifyWith(chave)
                    .requireIssuer(propriedades.emissor())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Optional.ofNullable(conteudo.getSubject());
        } catch (JwtException | IllegalArgumentException excecao) {
            return Optional.empty();
        }
    }

    public record TokenEmitido(String valor, Instant expiraEm) {
    }
}
