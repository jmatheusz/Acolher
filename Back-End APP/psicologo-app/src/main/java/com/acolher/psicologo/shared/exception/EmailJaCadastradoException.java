package com.acolher.psicologo.shared.exception;

public class EmailJaCadastradoException extends RuntimeException {

    private final String campo;

    public EmailJaCadastradoException() {
        this("email", "Este e-mail já está cadastrado.");
    }

    public EmailJaCadastradoException(String campo, String mensagem) {
        super(mensagem);
        this.campo = campo;
    }

    public String getCampo() {
        return campo;
    }
}
