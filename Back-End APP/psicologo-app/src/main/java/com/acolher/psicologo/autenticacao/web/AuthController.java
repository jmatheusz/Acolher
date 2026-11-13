package com.acolher.psicologo.autenticacao.web;

import com.acolher.psicologo.autenticacao.dto.Confirmacao;
import com.acolher.psicologo.autenticacao.dto.Credenciais;
import com.acolher.psicologo.autenticacao.dto.EnderecoDeEmail;
import com.acolher.psicologo.autenticacao.dto.NovoUsuario;
import com.acolher.psicologo.autenticacao.dto.TokenDeAcesso;
import com.acolher.psicologo.autenticacao.servico.AutenticacaoService;
import com.acolher.psicologo.autenticacao.servico.CadastroService;
import com.acolher.psicologo.autenticacao.servico.VerificacaoDeEmailService;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticacao", description = "Cadastro, verificacao de e-mail e login")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
@SecurityRequirements
public class AuthController {

    private final CadastroService cadastroService;
    private final AutenticacaoService autenticacaoService;
    private final VerificacaoDeEmailService verificacaoService;

    @Operation(summary = "Cria uma conta e envia o e-mail de verificacao")
    @PostMapping("/cadastro")
    public ResponseEntity<DadosUsuario> cadastrar(@RequestBody @Valid NovoUsuario dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroService.cadastrar(dados));
    }

    @Operation(summary = "Confirma o e-mail e ativa a conta")
    @GetMapping("/verificar")
    public ResponseEntity<Confirmacao> verificar(@RequestParam @NotBlank String token) {
        verificacaoService.confirmar(token);
        return ResponseEntity.ok(new Confirmacao("Conta ativada com sucesso"));
    }

    @Operation(summary = "Reenvia o e-mail de verificacao")
    @PostMapping("/reenviar-verificacao")
    public ResponseEntity<Confirmacao> reenviar(@RequestBody @Valid EnderecoDeEmail dados) {
        verificacaoService.reenviar(dados.email());
        return ResponseEntity.accepted()
                .body(new Confirmacao("Se houver uma conta pendente para este e-mail, o link foi reenviado"));
    }

    @Operation(summary = "Autentica e devolve o token de acesso")
    @PostMapping("/login")
    public ResponseEntity<TokenDeAcesso> login(@RequestBody @Valid Credenciais credenciais) {
        return ResponseEntity.ok(autenticacaoService.autenticar(credenciais));
    }
}
