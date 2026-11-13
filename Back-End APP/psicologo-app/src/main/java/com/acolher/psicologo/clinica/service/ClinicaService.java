package com.acolher.psicologo.clinica.service;

import com.acolher.psicologo.clinica.dto.*;
import com.acolher.psicologo.clinica.entity.*;
import com.acolher.psicologo.clinica.repository.*;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicaService {

    private final UsuarioRepository usuarioRepository;
    private final DisponibilidadeRepository disponibilidadeRepository;
    private final BloqueioAgendaRepository bloqueioAgendaRepository;
    private final ConsultaRepository consultaRepository;
    private final ProntuarioRepository prontuarioRepository;
    private final PagamentoRepository pagamentoRepository;

    public Usuario carregarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + email));
    }

    // ==========================================
    // 1. DISPONIBILIDADE & HORÁRIOS (Fase 3.1)
    // ==========================================

    @Transactional(readOnly = true)
    public List<DisponibilidadeDTO> listarDisponibilidade(String emailPsicologo) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        return disponibilidadeRepository.findByPsicologoIdOrderByDiaSemanaAscHoraInicioAsc(psicologo.getId())
                .stream().map(DisponibilidadeDTO::de).toList();
    }

    @Transactional
    public DisponibilidadeDTO salvarDisponibilidade(String emailPsicologo, DisponibilidadeDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);

        Disponibilidade disp;
        if (dto.id() != null) {
            disp = disponibilidadeRepository.findById(dto.id())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Horário não encontrado"));
            if (!disp.getPsicologo().getId().equals(psicologo.getId())) {
                throw new AccessDeniedException("Acesso não autorizado a este horário.");
            }
            disp.setDiaSemana(dto.diaSemana());
            disp.setHoraInicio(dto.horaInicio());
            disp.setHoraFim(dto.horaFim());
            disp.setDuracaoMinutos(dto.duracaoMinutos() != null ? dto.duracaoMinutos() : 50);
            disp.setIntervaloMinutos(dto.intervaloMinutos() != null ? dto.intervaloMinutos() : 10);
            disp.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        } else {
            disp = new Disponibilidade(
                    psicologo,
                    dto.diaSemana(),
                    dto.horaInicio(),
                    dto.horaFim(),
                    dto.duracaoMinutos(),
                    dto.intervaloMinutos()
            );
        }

        return DisponibilidadeDTO.de(disponibilidadeRepository.save(disp));
    }

    @Transactional
    public void alternarStatusDisponibilidade(String emailPsicologo, Integer id) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Disponibilidade disp = disponibilidadeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Horário não encontrado"));

        if (!disp.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }
        disp.setAtivo(!disp.getAtivo());
        disponibilidadeRepository.save(disp);
    }

    @Transactional
    public void excluirDisponibilidade(String emailPsicologo, Integer id) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Disponibilidade disp = disponibilidadeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Horário não encontrado"));

        if (!disp.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }
        disponibilidadeRepository.delete(disp);
    }

    // ==========================================
    // 2. BLOQUEIO DE AGENDAS (Férias/Folgas)
    // ==========================================

    @Transactional(readOnly = true)
    public List<BloqueioAgendaDTO> listarBloqueios(String emailPsicologo) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        return bloqueioAgendaRepository.findByPsicologoIdOrderByDataInicioAsc(psicologo.getId())
                .stream().map(BloqueioAgendaDTO::de).toList();
    }

    @Transactional
    public BloqueioAgendaDTO salvarBloqueio(String emailPsicologo, BloqueioAgendaDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        BloqueioAgenda bloqueio = new BloqueioAgenda(psicologo, dto.dataInicio(), dto.dataFim(), dto.motivo());
        return BloqueioAgendaDTO.de(bloqueioAgendaRepository.save(bloqueio));
    }

    @Transactional
    public void excluirBloqueio(String emailPsicologo, Integer id) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        BloqueioAgenda bloqueio = bloqueioAgendaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Bloqueio não encontrado"));

        if (!bloqueio.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }
        bloqueioAgendaRepository.delete(bloqueio);
    }

    // ==========================================
    // 3. AGENDA & CONSULTAS (Fase 3.2 e 3.3)
    // ==========================================

    @Transactional(readOnly = true)
    public List<ConsultaDTO> listarConsultasDoPsicologo(String emailPsicologo, LocalDate data, LocalDate dataInicio, LocalDate dataFim) {
        Usuario psicologo = carregarUsuario(emailPsicologo);

        if (data != null) {
            return consultaRepository.findByPsicologoIdAndDataConsultaOrderByHoraInicioAsc(psicologo.getId(), data)
                    .stream().map(ConsultaDTO::de).toList();
        }

        LocalDate inicio = dataInicio != null ? dataInicio : LocalDate.now().minusDays(30);
        LocalDate fim = dataFim != null ? dataFim : LocalDate.now().plusDays(60);

        return consultaRepository.findByPsicologoIdAndDataConsultaBetweenOrderByDataConsultaAscHoraInicioAsc(psicologo.getId(), inicio, fim)
                .stream().map(ConsultaDTO::de).toList();
    }

    @Transactional
    public ConsultaDTO criarConsultaPeloPsicologo(String emailPsicologo, CriarConsultaDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Usuario paciente = usuarioRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        LocalTime fim = dto.horaFim() != null ? dto.horaFim() : dto.horaInicio().plusMinutes(50);

        // Validação anti-conflito de horários
        validarConflitoHorario(psicologo.getId(), dto.dataConsulta(), dto.horaInicio(), fim, null);

        Consulta consulta = new Consulta(
                psicologo,
                paciente,
                dto.dataConsulta(),
                dto.horaInicio(),
                fim,
                dto.tipo(),
                dto.modalidade(),
                dto.observacoes()
        );
        consulta.setStatus(StatusConsulta.CONFIRMADA); // Criada diretamente pelo psicólogo nasce confirmada

        return ConsultaDTO.de(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaDTO alterarStatusConsulta(String emailPsicologo, Integer consultaId, StatusConsulta novoStatus, String motivo) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        if (!consulta.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }

        consulta.setStatus(novoStatus);
        if (novoStatus == StatusConsulta.CANCELADA) {
            consulta.setMotivoCancelamento(motivo);
        }
        return ConsultaDTO.de(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaDTO marcarPresenca(String emailPsicologo, Integer consultaId, Comparecimento compareceu) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        if (!consulta.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }

        consulta.setCompareceu(compareceu);
        if (compareceu == Comparecimento.PRESENTE) {
            consulta.setStatus(StatusConsulta.REALIZADA);
        } else if (compareceu == Comparecimento.FALTOU) {
            consulta.setStatus(StatusConsulta.FALTOU);
        }
        return ConsultaDTO.de(consultaRepository.save(consulta));
    }

    @Transactional
    public ConsultaDTO remarcarConsulta(String emailPsicologo, Integer consultaId, LocalDate novaData, LocalTime novaHoraInicio, LocalTime novaHoraFim) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Consulta consulta = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        if (!consulta.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso não autorizado.");
        }

        LocalTime fim = novaHoraFim != null ? novaHoraFim : novaHoraInicio.plusMinutes(50);
        validarConflitoHorario(psicologo.getId(), novaData, novaHoraInicio, fim, consultaId);

        consulta.setDataConsulta(novaData);
        consulta.setHoraInicio(novaHoraInicio);
        consulta.setHoraFim(fim);
        consulta.setStatus(StatusConsulta.CONFIRMADA);
        return ConsultaDTO.de(consultaRepository.save(consulta));
    }

    // ==========================================
    // 4. PACIENTES VINCULADOS (Fase 3.4)
    // ==========================================

    @Transactional(readOnly = true)
    public List<PacienteResumoDTO> listarPacientesDoPsicologo(String emailPsicologo) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        List<Usuario> pacientes = consultaRepository.listarPacientesDoPsicologo(psicologo.getId());

        List<PacienteResumoDTO> resultado = new ArrayList<>();
        for (Usuario p : pacientes) {
            List<Consulta> historico = consultaRepository.findByPacienteIdOrderByDataConsultaDescHoraInicioDesc(p.getId());
            LocalDate ultima = historico.isEmpty() ? null : historico.get(0).getDataConsulta();
            resultado.add(PacienteResumoDTO.de(p, historico.size(), ultima));
        }
        return resultado;
    }

    // ==========================================
    // 5. PRONTUÁRIOS (LGPD) (Fase 3.5)
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProntuarioDTO> listarProntuarios(String emailPsicologo, Integer pacienteId) {
        Usuario psicologo = carregarUsuario(emailPsicologo);

        if (pacienteId != null) {
            return prontuarioRepository.findByPsicologoIdAndPacienteIdOrderByDataRegistroDesc(psicologo.getId(), pacienteId)
                    .stream().map(ProntuarioDTO::de).toList();
        }
        return prontuarioRepository.findByPsicologoIdOrderByDataRegistroDesc(psicologo.getId())
                .stream().map(ProntuarioDTO::de).toList();
    }

    @Transactional
    public ProntuarioDTO criarProntuario(String emailPsicologo, CriarProntuarioDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Usuario paciente = usuarioRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        Consulta consulta = null;
        if (dto.consultaId() != null) {
            consulta = consultaRepository.findById(dto.consultaId()).orElse(null);
        }

        Prontuario prontuario = new Prontuario(
                psicologo,
                paciente,
                consulta,
                dto.titulo(),
                dto.anotacoes(),
                dto.evolucao()
        );
        return ProntuarioDTO.de(prontuarioRepository.save(prontuario));
    }

    @Transactional
    public ProntuarioDTO atualizarProntuario(String emailPsicologo, Integer id, CriarProntuarioDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Prontuario p = prontuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Prontuário não encontrado"));

        if (!p.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso restrito ao psicólogo responsável.");
        }

        p.setTitulo(dto.titulo());
        p.setAnotacoes(dto.anotacoes());
        p.setEvolucao(dto.evolucao());
        return ProntuarioDTO.de(prontuarioRepository.save(p));
    }

    @Transactional
    public void excluirProntuario(String emailPsicologo, Integer id) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Prontuario p = prontuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Prontuário não encontrado"));

        if (!p.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso restrito ao psicólogo responsável.");
        }
        prontuarioRepository.delete(p);
    }

    // ==========================================
    // 6. FINANÇAS & PAGAMENTOS (Fase 3.6)
    // ==========================================

    @Transactional(readOnly = true)
    public ResumoFinanceiroDTO obterResumoFinanceiro(String emailPsicologo, LocalDate inicio, LocalDate fim) {
        Usuario psicologo = carregarUsuario(emailPsicologo);

        List<Pagamento> lancamentos;
        if (inicio != null && fim != null) {
            lancamentos = pagamentoRepository.findByPsicologoIdAndDataVencimentoBetweenOrderByDataVencimentoDesc(
                    psicologo.getId(), inicio, fim);
        } else {
            lancamentos = pagamentoRepository.findByPsicologoIdOrderByDataVencimentoDesc(psicologo.getId());
        }

        BigDecimal recebido = lancamentos.stream()
                .filter(p -> p.getStatus() == StatusPagamento.PAGO)
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal aReceber = lancamentos.stream()
                .filter(p -> p.getStatus() == StatusPagamento.PENDENTE)
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = recebido.add(aReceber);

        return new ResumoFinanceiroDTO(
                recebido,
                aReceber,
                total,
                lancamentos.size(),
                lancamentos.stream().map(PagamentoDTO::de).toList()
        );
    }

    @Transactional
    public PagamentoDTO criarLancamentoFinanceiro(String emailPsicologo, CriarPagamentoDTO dto) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Usuario paciente = usuarioRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        Consulta consulta = null;
        if (dto.consultaId() != null) {
            consulta = consultaRepository.findById(dto.consultaId()).orElse(null);
        }

        Pagamento p = new Pagamento(
                psicologo,
                paciente,
                consulta,
                dto.valor(),
                dto.dataVencimento(),
                dto.formaPagamento(),
                dto.descricao()
        );
        return PagamentoDTO.de(pagamentoRepository.save(p));
    }

    @Transactional
    public PagamentoDTO atualizarStatusPagamento(String emailPsicologo, Integer id, StatusPagamento status) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        Pagamento p = pagamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lançamento financeiro não encontrado"));

        if (!p.getPsicologo().getId().equals(psicologo.getId())) {
            throw new AccessDeniedException("Acesso restrito.");
        }

        p.setStatus(status);
        if (status == StatusPagamento.PAGO) {
            p.setDataPagamento(LocalDate.now());
        } else {
            p.setDataPagamento(null);
        }
        return PagamentoDTO.de(pagamentoRepository.save(p));
    }

    // ==========================================
    // 7. MÉTRICAS REAIS DO PAINEL CLÍNICO
    // ==========================================

    @Transactional(readOnly = true)
    public PainelClinicoDTO obterMetricasPainel(String emailPsicologo) {
        Usuario psicologo = carregarUsuario(emailPsicologo);
        LocalDate hoje = LocalDate.now();

        long sessoesHoje = consultaRepository.countByPsicologoIdAndDataConsulta(psicologo.getId(), hoje);
        long totalPacientes = consultaRepository.contarPacientesUnicosDoPsicologo(psicologo.getId());

        long presencas = consultaRepository.countByPsicologoIdAndCompareceu(psicologo.getId(), Comparecimento.PRESENTE);
        long faltas = consultaRepository.countByPsicologoIdAndCompareceu(psicologo.getId(), Comparecimento.FALTOU);
        long totalAvaliadas = presencas + faltas;
        double taxaPresenca = totalAvaliadas > 0 ? ((double) presencas / totalAvaliadas) * 100.0 : 100.0;

        BigDecimal totalRecebido = pagamentoRepository.somarPorStatus(psicologo.getId(), StatusPagamento.PAGO);
        BigDecimal totalAReceber = pagamentoRepository.somarPorStatus(psicologo.getId(), StatusPagamento.PENDENTE);

        List<ConsultaDTO> agendaHoje = consultaRepository.findByPsicologoIdAndDataConsultaOrderByHoraInicioAsc(psicologo.getId(), hoje)
                .stream().map(ConsultaDTO::de).toList();

        return new PainelClinicoDTO(
                sessoesHoje,
                totalPacientes,
                Math.round(taxaPresenca * 10.0) / 10.0,
                presencas,
                faltas,
                totalRecebido != null ? totalRecebido : BigDecimal.ZERO,
                totalAReceber != null ? totalAReceber : BigDecimal.ZERO,
                agendaHoje
        );
    }

    // ==========================================
    // 8. CÁLCULO DE SLOTS LIVRES (Fase 4 - Paciente)
    // ==========================================

    @Transactional(readOnly = true)
    public List<SlotHorarioDTO> calcularHorariosLivres(Integer psicologoId, LocalDate data) {
        List<SlotHorarioDTO> slots = new ArrayList<>();

        // 1. Verifica se a data está bloqueada
        if (bloqueioAgendaRepository.dataEstaBloqueada(psicologoId, data)) {
            return slots; // Vazio se estiver de folga/férias
        }

        // 2. Busca disponibilidade cadastrada para o dia da semana (1=Segunda ... 7=Domingo)
        int diaSemana = data.getDayOfWeek().getValue();
        List<Disponibilidade> regras = disponibilidadeRepository.findByPsicologoIdAndDiaSemanaAndAtivoTrue(psicologoId, diaSemana);

        if (regras.isEmpty()) {
            return slots;
        }

        // 3. Busca consultas agendadas do psicólogo nesse dia
        List<Consulta> agendadas = consultaRepository.findByPsicologoIdAndDataConsultaOrderByHoraInicioAsc(psicologoId, data)
                .stream().filter(c -> c.getStatus() != StatusConsulta.CANCELADA).toList();

        for (Disponibilidade regra : regras) {
            LocalTime atual = regra.getHoraInicio();
            int duracao = regra.getDuracaoMinutos();
            int intervalo = regra.getIntervaloMinutos();

            while (atual.plusMinutes(duracao).isBefore(regra.getHoraFim()) || atual.plusMinutes(duracao).equals(regra.getHoraFim())) {
                LocalTime slotFim = atual.plusMinutes(duracao);

                // Verifica se há conflito com consulta existente
                final LocalTime inicio = atual;
                boolean temConflito = agendadas.stream().anyMatch(c ->
                        inicio.isBefore(c.getHoraFim()) && slotFim.isAfter(c.getHoraInicio()));

                slots.add(new SlotHorarioDTO(data, inicio, slotFim, !temConflito));

                atual = slotFim.plusMinutes(intervalo);
            }
        }

        return slots;
    }

    private void validarConflitoHorario(Integer psicologoId, LocalDate data, LocalTime inicio, LocalTime fim, Integer consultaIdExcluir) {
        List<Consulta> conflitos = consultaRepository.buscarConflitos(psicologoId, data, inicio, fim);
        if (consultaIdExcluir != null) {
            conflitos = conflitos.stream().filter(c -> !c.getId().equals(consultaIdExcluir)).toList();
        }
        if (!conflitos.isEmpty()) {
            throw new IllegalArgumentException("Já existe uma consulta agendada para este psicólogo no horário informado (" +
                    conflitos.get(0).getHoraInicio() + " às " + conflitos.get(0).getHoraFim() + ").");
        }
    }
}

