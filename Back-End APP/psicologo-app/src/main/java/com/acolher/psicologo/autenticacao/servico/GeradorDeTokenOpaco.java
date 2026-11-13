package com.acolher.psicologo.autenticacao.servico;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Component
public class GeradorDeTokenOpaco {

    private static final int TAMANHO_EM_BYTES = 32;

    private final SecureRandom aleatorio = new SecureRandom();
    private final Base64.Encoder codificador = Base64.getUrlEncoder().withoutPadding();

    public String gerar() {
        byte[] bytes = new byte[TAMANHO_EM_BYTES];
        aleatorio.nextBytes(bytes);
        return codificador.encodeToString(bytes);
    }

    public String resumir(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException excecao) {
            throw new IllegalStateException("Algoritmo de hash indisponivel", excecao);
        }
    }
}
