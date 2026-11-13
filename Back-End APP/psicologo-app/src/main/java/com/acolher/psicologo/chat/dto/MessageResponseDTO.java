package com.acolher.psicologo.chat.dto;

import com.acolher.psicologo.chat.entity.Mensagem;

import java.time.LocalDateTime;

public record MessageResponseDTO(
        Integer id,
        Integer chatId,
        Integer remetenteId,
        String remetenteNome,
        String conteudoTexto,
        String tipoMidia,
        LocalDateTime enviadaEm,
        boolean lida,
        LocalDateTime ultimaLeitura,
        boolean me
) {
    public static MessageResponseDTO de(Mensagem mensagem) {
        return de(mensagem, null);
    }

    public static MessageResponseDTO de(Mensagem mensagem, Integer meuUsuarioId) {
        boolean eMeu = meuUsuarioId != null && mensagem.getRemetente() != null && meuUsuarioId.equals(mensagem.getRemetente().getId());
        return new MessageResponseDTO(
                mensagem.getId(),
                mensagem.getChat() != null ? mensagem.getChat().getId() : null,
                mensagem.getRemetente() != null ? mensagem.getRemetente().getId() : null,
                mensagem.getRemetente() != null ? mensagem.getRemetente().getNomeCompleto() : null,
                mensagem.getConteudoTexto(),
                mensagem.getTipoMidia() != null ? mensagem.getTipoMidia().name() : "texto",
                mensagem.getEnviadaEm(),
                mensagem.isLida(),
                mensagem.getUltimaLeitura(),
                eMeu
        );
    }
}
