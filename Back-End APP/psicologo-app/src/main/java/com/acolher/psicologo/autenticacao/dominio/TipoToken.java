package com.acolher.psicologo.autenticacao.dominio;

import java.util.Arrays;

public enum TipoToken {

    VERIFICACAO_EMAIL(1),
    REDEFINICAO_SENHA(2);

    private final int codigo;

    TipoToken(int codigo) {
        this.codigo = codigo;
    }

    public int codigo() {
        return codigo;
    }

    public static TipoToken porCodigo(int codigo) {
        return Arrays.stream(values())
                .filter(tipo -> tipo.codigo == codigo)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Codigo de token desconhecido: " + codigo));
    }
}
