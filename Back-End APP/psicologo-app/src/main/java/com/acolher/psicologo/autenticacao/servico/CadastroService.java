package com.acolher.psicologo.autenticacao.servico;

import com.acolher.psicologo.autenticacao.dto.NovoUsuario;
import com.acolher.psicologo.especialista.entity.Especialidade;
import com.acolher.psicologo.especialista.repository.EspecialidadeRepository;
import com.acolher.psicologo.shared.exception.EmailJaCadastradoException;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CadastroService {

    private final UsuarioRepository repository;
    private final EspecialidadeRepository especialidadeRepository;
    private final PasswordEncoder codificadorDeSenha;
    private final VerificacaoDeEmailService verificacao;

    @Transactional
    public DadosUsuario cadastrar(NovoUsuario dados) {
        String email = normalizar(dados.email());

        if (repository.existsByEmail(email)) {
            throw new EmailJaCadastradoException("email", "Este e-mail já está cadastrado.");
        }

        Usuario usuario = repository.save(Usuario.novo(
                dados.nomeCompleto().trim(),
                email,
                codificadorDeSenha.encode(dados.senha()),
                dados.tipo(),
                dados.desejaAnonimato()));

        // Ativação imediata para testes e desenvolvimento
        usuario.ativar();
        usuario = repository.save(usuario);

        // Se for especialista, já persiste também os dados em Especialidades
        if (dados.tipo() == TipoUsuario.especialista) {
            Especialidade esp = new Especialidade();
            esp.setUsuario(usuario);
            esp.setNome(dados.nomeCompleto().trim());
            esp.setCodigoCrp(dados.crp() != null && !dados.crp().isBlank() ? dados.crp().trim() : "CRP Em Análise");
            esp.setCredenciais(dados.credenciais() != null && !dados.credenciais().isBlank() ? dados.credenciais().trim() : "Psicólogo(a) Clínico(a)");
            esp.setEspecialidade(dados.especialidade() != null && !dados.especialidade().isBlank() ? dados.especialidade().trim() : "Psicologia Geral");
            esp.setBiografia(dados.biografia() != null && !dados.biografia().isBlank() ? dados.biografia().trim() : "Profissional cadastrado no Projeto Acolher.");
            esp.setDisponivel(true);
            esp.setDataEmissao(LocalDate.now());
            especialidadeRepository.save(esp);
        }

        verificacao.enviarPara(usuario);

        return DadosUsuario.de(usuario);
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
