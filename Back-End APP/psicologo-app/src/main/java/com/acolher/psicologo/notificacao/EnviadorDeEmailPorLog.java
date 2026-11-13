package com.acolher.psicologo.notificacao;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.email.modo", havingValue = "log", matchIfMissing = true)
public class EnviadorDeEmailPorLog implements EnviadorDeEmail {

    @Override
    public void enviar(String destinatario, String assunto, String corpo) {
        log.info("E-mail simulado para {} | assunto: {}\n{}", destinatario, assunto, corpo);
    }
}
