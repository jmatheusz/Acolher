package com.acolher.psicologo.clinica.entity;

import com.acolher.psicologo.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "Consulta")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Usuario psicologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @Column(name = "data_consulta", nullable = false)
    private LocalDate dataConsulta;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoConsulta tipo = TipoConsulta.SESSAO_TERAPIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ModalidadeConsulta modalidade = ModalidadeConsulta.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusConsulta status = StatusConsulta.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Comparecimento compareceu = Comparecimento.PENDENTE;

    @Column(length = 1000)
    private String observacoes;

    @Column(name = "motivo_cancelamento", length = 500)
    private String motivoCancelamento;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Consulta(Usuario psicologo, Usuario paciente, LocalDate dataConsulta,
                    LocalTime horaInicio, LocalTime horaFim, TipoConsulta tipo,
                    ModalidadeConsulta modalidade, String observacoes) {
        this.psicologo = psicologo;
        this.paciente = paciente;
        this.dataConsulta = dataConsulta;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.tipo = tipo != null ? tipo : TipoConsulta.SESSAO_TERAPIA;
        this.modalidade = modalidade != null ? modalidade : ModalidadeConsulta.ONLINE;
        this.observacoes = observacoes;
        this.status = StatusConsulta.PENDENTE;
        this.compareceu = Comparecimento.PENDENTE;
        this.criadoEm = LocalDateTime.now();
    }
}

