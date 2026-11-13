package com.acolher.psicologo.clinica.entity;

import com.acolher.psicologo.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalTime;

@Entity
@Table(name = "Disponibilidade")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Disponibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Usuario psicologo;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana; // 1 = Segunda ... 7 = Domingo

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(name = "duracao_minutos", nullable = false)
    private Integer duracaoMinutos = 50;

    @Column(name = "intervalo_minutos", nullable = false)
    private Integer intervaloMinutos = 10;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Disponibilidade(Usuario psicologo, Integer diaSemana, LocalTime horaInicio,
                           LocalTime horaFim, Integer duracaoMinutos, Integer intervaloMinutos) {
        this.psicologo = psicologo;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.duracaoMinutos = duracaoMinutos != null ? duracaoMinutos : 50;
        this.intervaloMinutos = intervaloMinutos != null ? intervaloMinutos : 10;
        this.ativo = true;
    }
}

