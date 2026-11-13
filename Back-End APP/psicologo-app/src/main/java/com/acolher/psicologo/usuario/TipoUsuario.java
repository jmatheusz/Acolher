package com.acolher.psicologo.usuario;

public enum TipoUsuario {
    usuario,
    especialista;

    public String papel() {
        return name().toUpperCase();
    }
}
