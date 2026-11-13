package com.acolher.psicologo.autenticacao.web;

import com.acolher.psicologo.autenticacao.dto.NovoUsuario;
import com.acolher.psicologo.autenticacao.servico.AutenticacaoService;
import com.acolher.psicologo.autenticacao.servico.CadastroService;
import com.acolher.psicologo.autenticacao.servico.VerificacaoDeEmailService;
import com.acolher.psicologo.seguranca.PontoDeEntradaNaoAutorizado;
import com.acolher.psicologo.seguranca.jwt.JwtService;
import com.acolher.psicologo.shared.exception.ApiExceptionHandler;
import com.acolher.psicologo.shared.exception.EmailJaCadastradoException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CadastroService cadastroService;

    @MockitoBean
    private AutenticacaoService autenticacaoService;

    @MockitoBean
    private VerificacaoDeEmailService verificacaoService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private PontoDeEntradaNaoAutorizado pontoDeEntrada;

    @Test
    @DisplayName("POST /auth/cadastro deve retornar 409 com campo e mensagem quando email for duplicado")
    void deveRetornar409ComJsonClaroQuandoEmailDuplicado() throws Exception {
        NovoUsuario novo = new NovoUsuario(
                "Maria Duplicada",
                "maria@exemplo.com",
                "SenhaForte123",
                false,
                null,
                null, null, null, null
        );

        when(cadastroService.cadastrar(any(NovoUsuario.class)))
                .thenThrow(new EmailJaCadastradoException("email", "Este e-mail já está cadastrado."));

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novo)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.campo").value("email"))
                .andExpect(jsonPath("$.mensagem").value("Este e-mail já está cadastrado."));
    }
}

