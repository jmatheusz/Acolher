package com.acolher.psicologo.shared.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SimNaoConverter implements AttributeConverter<Boolean, String> {

    private static final String SIM = "sim";
    private static final String NAO = "nao";

    @Override
    public String convertToDatabaseColumn(Boolean valor) {
        return Boolean.TRUE.equals(valor) ? SIM : NAO;
    }

    @Override
    public Boolean convertToEntityAttribute(String valor) {
        return SIM.equalsIgnoreCase(valor);
    }
}
