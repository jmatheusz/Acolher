package com.acolher.psicologo.especialista.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Especialidades")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@EqualsAndHashCode(of = "id")
public class Especialidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "codigo_crp", length = 20)
    private String codigoCrp;

    @Column(length = 255)
    private String credenciais;

    @Column(nullable = false)
    private Boolean disponivel;

    @Column(length = 100)
    private String especialidade;

    @Column(length = 1000)
    private String biografia;

    @Column(name = "nota_media", precision = 3, scale = 2)
    private BigDecimal notaMedia;

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    public Especialidade(Usuario usuario, String nome, String codigoCrp, String credenciais,
                         String especialidade, String biografia, Boolean disponivel) {
        this.usuario = usuario;
        this.nome = nome;
        this.codigoCrp = codigoCrp;
        this.credenciais = credenciais;
        this.especialidade = especialidade;
        this.biografia = biografia;
        this.disponivel = disponivel != null ? disponivel : true;
        this.dataEmissao = LocalDate.now();
    }
}
