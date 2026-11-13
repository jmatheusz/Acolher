package com.acolher.psicologo.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException excecao,
                                                                  HttpHeaders cabecalhos,
                                                                  HttpStatusCode status,
                                                                  WebRequest requisicao) {
        Map<String, String> campos = new LinkedHashMap<>();
        excecao.getBindingResult().getFieldErrors()
                .forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));

        ProblemDetail problema = montar(HttpStatus.BAD_REQUEST, "Dados invalidos",
                "Verifique os campos informados");
        problema.setProperty("campos", campos);

        return ResponseEntity.badRequest().body(problema);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail tratarViolacaoDeRestricao(ConstraintViolationException excecao) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (ConstraintViolation<?> violacao : excecao.getConstraintViolations()) {
            campos.putIfAbsent(violacao.getPropertyPath().toString(), violacao.getMessage());
        }

        ProblemDetail problema = montar(HttpStatus.BAD_REQUEST, "Dados invalidos",
                "Verifique os parametros informados");
        problema.setProperty("campos", campos);
        return problema;
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ProblemDetail tratarNaoEncontrado(RecursoNaoEncontradoException excecao) {
        return montar(HttpStatus.NOT_FOUND, "Recurso nao encontrado", excecao.getMessage());
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<com.acolher.psicologo.shared.dto.ErroConflitoDTO> tratarEmailDuplicado(EmailJaCadastradoException excecao) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new com.acolher.psicologo.shared.dto.ErroConflitoDTO(excecao.getCampo(), excecao.getMessage()));
    }

    @ExceptionHandler(TokenInvalidoException.class)
    public ProblemDetail tratarTokenInvalido(TokenInvalidoException excecao) {
        return montar(HttpStatus.BAD_REQUEST, "Token invalido", excecao.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail tratarCredenciaisInvalidas() {
        return montar(HttpStatus.UNAUTHORIZED, "Credenciais invalidas", "E-mail ou senha incorretos");
    }

    @ExceptionHandler(DisabledException.class)
    public ProblemDetail tratarContaPendente() {
        return montar(HttpStatus.FORBIDDEN, "Conta nao verificada",
                "Confirme seu e-mail para acessar a plataforma");
    }

    @ExceptionHandler(LockedException.class)
    public ProblemDetail tratarContaBloqueada() {
        return montar(HttpStatus.FORBIDDEN, "Conta bloqueada",
                "Esta conta foi suspensa. Entre em contato com o suporte");
    }

    @ExceptionHandler(com.acolher.psicologo.chat.exception.AcessoNegadoChatException.class)
    public ProblemDetail tratarAcessoNegadoChat(com.acolher.psicologo.chat.exception.AcessoNegadoChatException excecao) {
        return montar(HttpStatus.FORBIDDEN, "Acesso negado", excecao.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ProblemDetail tratarFalhaDeAutenticacao() {
        return montar(HttpStatus.UNAUTHORIZED, "Nao autenticado",
                "Autenticacao necessaria para acessar este recurso");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<com.acolher.psicologo.shared.dto.ErroConflitoDTO> tratarViolacaoDeIntegridade(
            DataIntegrityViolationException excecao,
            HttpServletRequest requisicao) {
        String msg = causaRaiz(excecao).getMessage();
        log.warn("Violacao de integridade em {}: {}", requisicao.getRequestURI(), msg);

        String campo = "geral";
        String detalhe = "A operacao viola uma regra de integridade dos dados";

        if (msg != null) {
            String lower = msg.toLowerCase();
            if (lower.contains("email") || lower.contains("usuario.email")) {
                campo = "email";
                detalhe = "Este e-mail já está cadastrado.";
            } else if (lower.contains("crp") || lower.contains("codigo_crp")) {
                campo = "crp";
                detalhe = "Este CRP já está cadastrado.";
            } else if (lower.contains("cpf")) {
                campo = "cpf";
                detalhe = "Este CPF já está cadastrado.";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new com.acolher.psicologo.shared.dto.ErroConflitoDTO(campo, detalhe));
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail tratarErroInesperado(Exception excecao, HttpServletRequest requisicao) {
        log.error("Erro inesperado em {}", requisicao.getRequestURI(), excecao);
        return montar(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno",
                "Nao foi possivel processar a requisicao");
    }

    private ProblemDetail montar(HttpStatus status, String titulo, String detalhe) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, detalhe);
        problema.setTitle(titulo);
        problema.setType(URI.create("https://acolher.app/erros/" + status.value()));
        problema.setProperty("momento", Instant.now());
        return problema;
    }

    private Throwable causaRaiz(Throwable excecao) {
        Throwable atual = excecao;
        while (atual.getCause() != null && atual.getCause() != atual) {
            atual = atual.getCause();
        }
        return atual;
    }
}
