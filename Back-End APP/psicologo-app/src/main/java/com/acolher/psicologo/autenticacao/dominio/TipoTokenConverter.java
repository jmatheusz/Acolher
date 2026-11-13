package com.acolher.psicologo.autenticacao.dominio;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class TipoTokenConverter implements AttributeConverter<TipoToken, Integer> {

    @Override
    public Integer convertToDatabaseColumn(TipoToken tipo) {
        return tipo == null ? null : tipo.codigo();
    }

    @Override
    public TipoToken convertToEntityAttribute(Integer codigo) {
        return codigo == null ? null : TipoToken.porCodigo(codigo);
    }
}
