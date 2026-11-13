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

import java.time.LocalDateTime;

@Entity
@Table(name = "Prontuario")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Prontuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Usuario psicologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id")
    private Consulta consulta;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro = LocalDateTime.now();

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String anotacoes;

    @Column(columnDefinition = "TEXT")
    private String evolucao;

    @Column(nullable = false)
    private Boolean sigiloso = true;

    public Prontuario(Usuario psicologo, Usuario paciente, Consulta consulta,
                      String titulo, String anotacoes, String evolucao) {
        this.psicologo = psicologo;
        this.paciente = paciente;
        this.consulta = consulta;
        this.titulo = titulo;
        this.anotacoes = anotacoes;
        this.evolucao = evolucao;
        this.dataRegistro = LocalDateTime.now();
        this.sigiloso = true;
    }
}

