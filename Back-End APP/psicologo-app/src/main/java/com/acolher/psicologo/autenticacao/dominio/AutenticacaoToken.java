package com.acolher.psicologo.autenticacao.dominio;

import com.acolher.psicologo.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Autenticacao_Token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class AutenticacaoToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Convert(converter = TipoTokenConverter.class)
    @Column(nullable = false)
    private TipoToken tipo;

    @Column(nullable = false, length = 255)
    private String token;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "usado_em")
    private LocalDate usadoEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private AutenticacaoToken(Usuario usuario, TipoToken tipo, String tokenCriptografado,
                              LocalDateTime expiraEm) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.token = tokenCriptografado;
        this.expiraEm = expiraEm;
    }

    public static AutenticacaoToken emitir(Usuario usuario, TipoToken tipo,
                                           String tokenCriptografado, LocalDateTime expiraEm) {
        return new AutenticacaoToken(usuario, tipo, tokenCriptografado, expiraEm);
    }

    public boolean utilizavel() {
        return usadoEm == null && expiraEm.isAfter(LocalDateTime.now());
    }

    public void marcarComoUsado() {
        this.usadoEm = LocalDate.now();
    }
}
