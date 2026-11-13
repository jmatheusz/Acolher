package com.acolher.psicologo.clinica.controller;

import com.acolher.psicologo.clinica.dto.*;
import com.acolher.psicologo.clinica.entity.Comparecimento;
import com.acolher.psicologo.clinica.entity.StatusConsulta;
import com.acolher.psicologo.clinica.entity.StatusPagamento;
import com.acolher.psicologo.clinica.service.ClinicaService;
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
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Tag(name = "Clínica & Gestão", description = "Endpoints exclusivos para gestão do psicólogo (painel, agenda, prontuários, finanças)")
@RestController
@RequestMapping("/api/clinica")
@RequiredArgsConstructor
public class ClinicaController {

    private final ClinicaService service;

    @Operation(summary = "Métricas reais do Painel Clínico do psicólogo")
    @GetMapping("/painel")
    public ResponseEntity<PainelClinicoDTO> obterPainel(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.obterMetricasPainel(autenticado.getUsername()));
    }

    // --- 1. Disponibilidade ---
    @Operation(summary = "Lista horários de disponibilidade do psicólogo")
    @GetMapping("/disponibilidade")
    public ResponseEntity<List<DisponibilidadeDTO>> listarDisponibilidade(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.listarDisponibilidade(autenticado.getUsername()));
    }

    @Operation(summary = "Cadastra ou altera horário de disponibilidade")
    @PostMapping("/disponibilidade")
    public ResponseEntity<DisponibilidadeDTO> salvarDisponibilidade(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid DisponibilidadeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvarDisponibilidade(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Ativa ou desativa horário")
    @PatchMapping("/disponibilidade/{id}/toggle")
    public ResponseEntity<Void> alternarDisponibilidade(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.alternarStatusDisponibilidade(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Exclui horário de disponibilidade")
    @DeleteMapping("/disponibilidade/{id}")
    public ResponseEntity<Void> excluirDisponibilidade(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.excluirDisponibilidade(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // --- 2. Bloqueios de Agenda ---
    @Operation(summary = "Lista bloqueios de agenda (folgas/férias)")
    @GetMapping("/bloqueios")
    public ResponseEntity<List<BloqueioAgendaDTO>> listarBloqueios(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.listarBloqueios(autenticado.getUsername()));
    }

    @Operation(summary = "Cadastra novo bloqueio de agenda")
    @PostMapping("/bloqueios")
    public ResponseEntity<BloqueioAgendaDTO> salvarBloqueio(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid BloqueioAgendaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvarBloqueio(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Exclui bloqueio de agenda")
    @DeleteMapping("/bloqueios/{id}")
    public ResponseEntity<Void> excluirBloqueio(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.excluirBloqueio(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // --- 3. Consultas e Agenda ---
    @Operation(summary = "Lista consultas da agenda do psicólogo")
    @GetMapping("/consultas")
    public ResponseEntity<List<ConsultaDTO>> listarConsultas(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok(service.listarConsultasDoPsicologo(autenticado.getUsername(), data, dataInicio, dataFim));
    }

    @Operation(summary = "Cria uma consulta pelo psicólogo")
    @PostMapping("/consultas")
    public ResponseEntity<ConsultaDTO> criarConsulta(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarConsultaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarConsultaPeloPsicologo(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Altera o status da consulta (CONFIRMADA, CANCELADA, etc.)")
    @PatchMapping("/consultas/{id}/status")
    public ResponseEntity<ConsultaDTO> alterarStatusConsulta(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        StatusConsulta status = StatusConsulta.valueOf(body.get("status"));
        String motivo = body.get("motivo");
        return ResponseEntity.ok(service.alterarStatusConsulta(autenticado.getUsername(), id, status, motivo));
    }

    @Operation(summary = "Marca comparecimento do paciente na consulta (PRESENTE / FALTOU)")
    @PatchMapping("/consultas/{id}/presenca")
    public ResponseEntity<ConsultaDTO> marcarPresenca(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        Comparecimento comparecimento = Comparecimento.valueOf(body.get("compareceu"));
        return ResponseEntity.ok(service.marcarPresenca(autenticado.getUsername(), id, comparecimento));
    }

    @Operation(summary = "Remarca horário e data de consulta")
    @PutMapping("/consultas/{id}/remarcar")
    public ResponseEntity<ConsultaDTO> remarcarConsulta(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        LocalDate novaData = LocalDate.parse(body.get("data").toString());
        LocalTime novaHoraInicio = LocalTime.parse(body.get("horaInicio").toString());
        LocalTime novaHoraFim = body.get("horaFim") != null ? LocalTime.parse(body.get("horaFim").toString()) : null;
        return ResponseEntity.ok(service.remarcarConsulta(autenticado.getUsername(), id, novaData, novaHoraInicio, novaHoraFim));
    }

    // --- 4. Pacientes ---
    @Operation(summary = "Lista pacientes vinculados ao psicólogo")
    @GetMapping("/pacientes")
    public ResponseEntity<List<PacienteResumoDTO>> listarPacientes(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.listarPacientesDoPsicologo(autenticado.getUsername()));
    }

    // --- 5. Prontuários (LGPD) ---
    @Operation(summary = "Lista prontuários clínicos (restrito ao psicólogo dono)")
    @GetMapping("/prontuarios")
    public ResponseEntity<List<ProntuarioDTO>> listarProntuarios(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestParam(required = false) Integer pacienteId) {
        return ResponseEntity.ok(service.listarProntuarios(autenticado.getUsername(), pacienteId));
    }

    @Operation(summary = "Cria novo prontuário clínico")
    @PostMapping("/prontuarios")
    public ResponseEntity<ProntuarioDTO> criarProntuario(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarProntuarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarProntuario(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Atualiza prontuário clínico existente")
    @PutMapping("/prontuarios/{id}")
    public ResponseEntity<ProntuarioDTO> atualizarProntuario(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody @Valid CriarProntuarioDTO dto) {
        return ResponseEntity.ok(service.atualizarProntuario(autenticado.getUsername(), id, dto));
    }

    @Operation(summary = "Exclui prontuário")
    @DeleteMapping("/prontuarios/{id}")
    public ResponseEntity<Void> excluirProntuario(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.excluirProntuario(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // --- 6. Finanças ---
    @Operation(summary = "Resumo financeiro e lançamentos do psicólogo")
    @GetMapping("/financas")
    public ResponseEntity<ResumoFinanceiroDTO> obterFinancas(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(service.obterResumoFinanceiro(autenticado.getUsername(), inicio, fim));
    }

    @Operation(summary = "Cria lançamento de pagamento")
    @PostMapping("/financas")
    public ResponseEntity<PagamentoDTO> criarPagamento(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarPagamentoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarLancamentoFinanceiro(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Atualiza status do pagamento (PAGO, PENDENTE, CANCELADO)")
    @PatchMapping("/financas/{id}/status")
    public ResponseEntity<PagamentoDTO> atualizarStatusPagamento(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        StatusPagamento status = StatusPagamento.valueOf(body.get("status"));
        return ResponseEntity.ok(service.atualizarStatusPagamento(autenticado.getUsername(), id, status));
    }
}

