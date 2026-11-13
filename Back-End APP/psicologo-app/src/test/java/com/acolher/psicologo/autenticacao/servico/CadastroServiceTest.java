package com.acolher.psicologo.autenticacao.servico;

import com.acolher.psicologo.autenticacao.dto.NovoUsuario;
import com.acolher.psicologo.especialista.repository.EspecialidadeRepository;
import com.acolher.psicologo.shared.exception.EmailJaCadastradoException;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CadastroServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EspecialidadeRepository especialidadeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private VerificacaoDeEmailService verificacaoService;

    @InjectMocks
    private CadastroService cadastroService;

    @Test
    @DisplayName("Deve lancar EmailJaCadastradoException quando email ja existir")
    void deveLancarExcecaoQuandoEmailJaExiste() {
        NovoUsuario novo = new NovoUsuario(
                "Teste Conflito",
                "existente@exemplo.com",
                "Senha1234",
                false,
                TipoUsuario.usuario,
                null, null, null, null
        );

        when(usuarioRepository.existsByEmail("existente@exemplo.com")).thenReturn(true);

        assertThatThrownBy(() -> cadastroService.cadastrar(novo))
                .isInstanceOf(EmailJaCadastradoException.class)
                .hasMessage("Este e-mail já está cadastrado.");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve cadastrar usuario com sucesso quando email nao existir")
    void deveCadastrarComSucesso() {
        NovoUsuario novo = new NovoUsuario(
                "Novo Usuario",
                "novo@exemplo.com",
                "Senha1234",
                false,
                TipoUsuario.usuario,
                null, null, null, null
        );

        when(usuarioRepository.existsByEmail("novo@exemplo.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DadosUsuario dados = cadastroService.cadastrar(novo);

        assertThat(dados).isNotNull();
        assertThat(dados.email()).isEqualTo("novo@exemplo.com");
        verify(usuarioRepository, atLeastOnce()).save(any(Usuario.class));
        verify(verificacaoService, times(1)).enviarPara(any());
    }
}

