package com.acolher.psicologo.clinica.service;

import com.acolher.psicologo.clinica.dto.ConsultaDTO;
import com.acolher.psicologo.clinica.dto.CriarConsultaDTO;
import com.acolher.psicologo.clinica.dto.SlotHorarioDTO;
import com.acolher.psicologo.clinica.entity.Consulta;
import com.acolher.psicologo.clinica.entity.StatusConsulta;
import com.acolher.psicologo.clinica.repository.ConsultaRepository;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgendamentoPacienteService {

    // Regra configurável de antecedência mínima para cancelamento pelo paciente (em horas)
    public static final int ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS = 2;

    private final UsuarioRepository usuarioRepository;
    private final ConsultaRepository consultaRepository;
    private final ClinicaService clinicaService;

    @Transactional(readOnly = true)
    public List<SlotHorarioDTO> buscarHorariosDisponiveis(Integer psicologoId, LocalDate data) {
        return clinicaService.calcularHorariosLivres(psicologoId, data);
    }

    @Transactional
    public ConsultaDTO agendarPeloPaciente(String emailPaciente, CriarConsultaDTO dto) {
        Usuario paciente = usuarioRepository.findByEmail(emailPaciente)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        Usuario psicologo = usuarioRepository.findById(dto.psicologoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Psicólogo não encontrado"));

        LocalTime fim = dto.horaFim() != null ? dto.horaFim() : dto.horaInicio().plusMinutes(50);

        // Validação anti-conflito
        List<Consulta> conflitos = consultaRepository.buscarConflitos(psicologo.getId(), dto.dataConsulta(), dto.horaInicio(), fim);
        if (!conflitos.isEmpty()) {
            throw new IllegalArgumentException("Este horário já foi reservado. Por favor, escolha outro slot.");
        }

        Consulta c = new Consulta(
                psicologo,
                paciente,
                dto.dataConsulta(),
                dto.horaInicio(),
                fim,
                dto.tipo(),
                dto.modalidade(),
                dto.observacoes()
        );
        c.setStatus(StatusConsulta.PENDENTE); // Nasce pendente de aprovação pelo psicólogo

        return ConsultaDTO.de(consultaRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<ConsultaDTO> listarMinhasConsultas(String emailPaciente) {
        Usuario paciente = usuarioRepository.findByEmail(emailPaciente)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        return consultaRepository.findByPacienteIdOrderByDataConsultaDescHoraInicioDesc(paciente.getId())
                .stream().map(ConsultaDTO::de).toList();
    }

    @Transactional
    public ConsultaDTO cancelarPeloPaciente(String emailPaciente, Integer consultaId, String motivo) {
        Usuario paciente = usuarioRepository.findByEmail(emailPaciente)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        Consulta c = consultaRepository.findById(consultaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        if (!c.getPaciente().getId().equals(paciente.getId())) {
            throw new AccessDeniedException("Você só pode cancelar suas próprias consultas.");
        }

        // Validação de antecedência mínima
        LocalDateTime dataHoraConsulta = LocalDateTime.of(c.getDataConsulta(), c.getHoraInicio());
        Duration diferenca = Duration.between(LocalDateTime.now(), dataHoraConsulta);
        if (diferenca.toHours() < ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS && !diferenca.isNegative()) {
            throw new IllegalArgumentException("O cancelamento deve ser feito com no mínimo " +
                    ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS + " horas de antecedência.");
        }

        c.setStatus(StatusConsulta.CANCELADA);
        c.setMotivoCancelamento(motivo != null ? motivo : "Cancelado pelo paciente");

        return ConsultaDTO.de(consultaRepository.save(c));
    }
}

