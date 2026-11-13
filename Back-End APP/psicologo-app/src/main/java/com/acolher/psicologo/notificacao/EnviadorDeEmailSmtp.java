package com.acolher.psicologo.notificacao;

import com.acolher.psicologo.config.EmailPropriedades;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.email.modo", havingValue = "smtp")
@RequiredArgsConstructor
public class EnviadorDeEmailSmtp implements EnviadorDeEmail {

    private final JavaMailSender remetente;
    private final EmailPropriedades propriedades;

    @Override
    public void enviar(String destinatario, String assunto, String corpo) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom(propriedades.remetente());
        mensagem.setTo(destinatario);
        mensagem.setSubject(assunto);
        mensagem.setText(corpo);

        try {
            remetente.send(mensagem);
        } catch (MailException excecao) {
            log.error("Falha ao enviar e-mail para {}", destinatario, excecao);
        }
    }
}
