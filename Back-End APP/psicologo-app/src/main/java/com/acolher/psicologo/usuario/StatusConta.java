package com.acolher.psicologo.usuario;

public enum StatusConta {
    pendente,
    ativo,
    suspenso,
    banido;

    public boolean permiteAcesso() {
        return this == ativo;
    }

    public boolean bloqueada() {
        return this == suspenso || this == banido;
    }
}
