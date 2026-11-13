package com.acolher.psicologo.autenticacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EnderecoDeEmail(
        @NotBlank(message = "Informe o e-mail")
        @Email(message = "E-mail invalido")
        String email) {
}
