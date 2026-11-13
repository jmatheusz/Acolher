package com.acolher.psicologo.notificacao;

public interface EnviadorDeEmail {

    void enviar(String destinatario, String assunto, String corpo);
}
