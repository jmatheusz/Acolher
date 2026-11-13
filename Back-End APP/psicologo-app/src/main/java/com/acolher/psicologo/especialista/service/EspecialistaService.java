package com.acolher.psicologo.especialista.service;

import com.acolher.psicologo.especialista.dto.DadosEspecialistaDTO;
import com.acolher.psicologo.especialista.entity.Especialidade;
import com.acolher.psicologo.especialista.repository.EspecialidadeRepository;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.StatusConta;
import com.acolher.psicologo.usuario.TipoUsuario;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EspecialistaService {

    private final EspecialidadeRepository especialidadeRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<DadosEspecialistaDTO> listarTodos() {
        List<DadosEspecialistaDTO> resultado = new ArrayList<>();
        Set<Integer> usuariosComEspecialidade = new HashSet<>();

        List<Especialidade> especialidades = especialidadeRepository.findByDisponivelTrue();
        for (Especialidade esp : especialidades) {
            resultado.add(DadosEspecialistaDTO.de(esp));
            if (esp.getUsuario() != null) {
                usuariosComEspecialidade.add(esp.getUsuario().getId());
            }
        }

        // Também inclui usuários especialistas ativos cadastrados no sistema
        List<Usuario> usuariosEspecialistas = usuarioRepository.findByTipo(TipoUsuario.especialista);
        for (Usuario u : usuariosEspecialistas) {
            if (!usuariosComEspecialidade.contains(u.getId()) && u.getStatus() != StatusConta.banido) {
                resultado.add(DadosEspecialistaDTO.deUsuarioEspecialista(u));
            }
        }

        return resultado;
    }

    @Transactional
    public DadosEspecialistaDTO salvarPerfilProfissional(Integer usuarioId, String nome, String codigoCrp, String credenciais, String especialidade, String biografia, Boolean disponivel) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com ID: " + usuarioId));

        Especialidade esp = especialidadeRepository.findByUsuarioId(usuarioId)
                .orElse(new Especialidade());

        esp.setUsuario(usuario);
        esp.setNome(nome != null && !nome.isBlank() ? nome : usuario.getNomeCompleto());
        esp.setCodigoCrp(codigoCrp);
        esp.setCredenciais(credenciais);
        esp.setEspecialidade(especialidade);
        esp.setBiografia(biografia);
        esp.setDisponivel(disponivel != null ? disponivel : true);
        if (esp.getDataEmissao() == null) {
            esp.setDataEmissao(LocalDate.now());
        }

        Especialidade salva = especialidadeRepository.save(esp);
        return DadosEspecialistaDTO.de(salva);
    }
}
