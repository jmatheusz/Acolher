package com.acolher.psicologo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtPropriedades(String secret, Duration expiracao, String emissor) {
}
