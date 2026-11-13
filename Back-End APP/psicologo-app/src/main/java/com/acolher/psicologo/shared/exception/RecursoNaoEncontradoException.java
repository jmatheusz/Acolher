package com.acolher.psicologo.shared.exception;

public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String recurso) {
        super(recurso + " nao encontrado");
    }
}
