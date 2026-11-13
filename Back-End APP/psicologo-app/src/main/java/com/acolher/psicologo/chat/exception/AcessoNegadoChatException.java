package com.acolher.psicologo.chat.exception;

public class AcessoNegadoChatException extends RuntimeException {

    public AcessoNegadoChatException(String mensagem) {
        super(mensagem);
    }

    public AcessoNegadoChatException() {
        super("Você não tem permissão para acessar ou enviar mensagens nesta conversa.");
    }
}

