package com.acolher.psicologo.chat.dto;

import java.time.LocalDateTime;

public record ChatSummaryDTO(
        Integer id,
        Integer outroParticipanteId,
        String outroParticipanteNome,
        String outroParticipanteFoto,
        String outroParticipanteTipo,
        String ultimaMensagem,
        LocalDateTime ultimaMensagemHorario,
        long mensagensNaoLidas,
        String status,
        String prioridade,
        LocalDateTime criadoEm
) {
}

