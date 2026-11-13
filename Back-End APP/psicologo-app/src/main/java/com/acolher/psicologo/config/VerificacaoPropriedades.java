package com.acolher.psicologo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.verificacao")
public record VerificacaoPropriedades(Duration validade, String rotaFrontend) {
}
