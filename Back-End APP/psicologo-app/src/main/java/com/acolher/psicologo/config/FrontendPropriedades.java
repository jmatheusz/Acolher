package com.acolher.psicologo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.frontend")
public record FrontendPropriedades(String url) {
}
