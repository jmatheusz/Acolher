package com.acolher.psicologo.autenticacao.dto;

import com.acolher.psicologo.usuario.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record NovoUsuario(
        @NotBlank(message = "Informe o nome completo")
        @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
        String nomeCompleto,

        @NotBlank(message = "Informe o e-mail")
        @Email(message = "E-mail invalido")
        @Size(max = 150, message = "E-mail muito longo")
        String email,

        @NotBlank(message = "Informe a senha")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
        @Pattern(regexp = ".*[A-Za-z].*", message = "A senha deve conter ao menos uma letra")
        @Pattern(regexp = ".*\\d.*", message = "A senha deve conter ao menos um numero")
        String senha,

        Boolean anonimo,

        TipoUsuario tipo,

        String crp,
        String especialidade,
        String credenciais,
        String biografia) {

    public boolean desejaAnonimato() {
        return Boolean.TRUE.equals(anonimo);
    }
}
