package com.acolher.psicologo.seguranca.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String CABECALHO = "Authorization";
    private static final String PREFIXO = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService detalhesDoUsuario;
    private final WebAuthenticationDetailsSource fonteDeDetalhes = new WebAuthenticationDetailsSource();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest requisicao,
                                    @NonNull HttpServletResponse resposta,
                                    @NonNull FilterChain cadeia) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            extrairToken(requisicao)
                    .flatMap(jwtService::extrairEmail)
                    .ifPresent(email -> autenticar(email, requisicao));
        }

        cadeia.doFilter(requisicao, resposta);
    }

    private Optional<String> extrairToken(HttpServletRequest requisicao) {
        String cabecalho = requisicao.getHeader(CABECALHO);

        if (cabecalho == null || !cabecalho.startsWith(PREFIXO)) {
            return Optional.empty();
        }

        String token = cabecalho.substring(PREFIXO.length()).trim();
        return token.isEmpty() ? Optional.empty() : Optional.of(token);
    }

    private void autenticar(String email, HttpServletRequest requisicao) {
        try {
            UserDetails usuario = detalhesDoUsuario.loadUserByUsername(email);

            if (!usuario.isEnabled() || !usuario.isAccountNonLocked()) {
                return;
            }

            UsernamePasswordAuthenticationToken autenticacao =
                    new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
            autenticacao.setDetails(fonteDeDetalhes.buildDetails(requisicao));

            SecurityContextHolder.getContext().setAuthentication(autenticacao);
        } catch (UsernameNotFoundException excecao) {
            SecurityContextHolder.clearContext();
        }
    }
}
