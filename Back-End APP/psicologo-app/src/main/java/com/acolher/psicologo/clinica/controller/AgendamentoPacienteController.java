package com.acolher.psicologo.clinica.controller;

import com.acolher.psicologo.clinica.dto.ConsultaDTO;
import com.acolher.psicologo.clinica.dto.CriarConsultaDTO;
import com.acolher.psicologo.clinica.dto.SlotHorarioDTO;
import com.acolher.psicologo.clinica.service.AgendamentoPacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Agendamento do Paciente", description = "Endpoints para o paciente visualizar horários livres e gerenciar suas consultas")
@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
public class AgendamentoPacienteController {

    private final AgendamentoPacienteService service;

    @Operation(summary = "Lista horários livres de um psicólogo em uma data específica")
    @GetMapping("/especialistas/{psicologoId}/slots")
    public ResponseEntity<List<SlotHorarioDTO>> buscarSlots(
            @PathVariable Integer psicologoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(service.buscarHorariosDisponiveis(psicologoId, data));
    }

    @Operation(summary = "Paciente solicita agendamento de consulta")
    @PostMapping
    public ResponseEntity<ConsultaDTO> agendar(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarConsultaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.agendarPeloPaciente(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Lista todas as consultas do paciente autenticado")
    @GetMapping("/minhas-consultas")
    public ResponseEntity<List<ConsultaDTO>> listarMinhasConsultas(
            @AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.listarMinhasConsultas(autenticado.getUsername()));
    }

    @Operation(summary = "Paciente cancela sua consulta com regra de antecedência")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ConsultaDTO> cancelar(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String motivo = body != null ? body.get("motivo") : null;
        return ResponseEntity.ok(service.cancelarPeloPaciente(autenticado.getUsername(), id, motivo));
    }
}

