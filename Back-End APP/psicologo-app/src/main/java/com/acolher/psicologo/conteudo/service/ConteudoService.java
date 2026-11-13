package com.acolher.psicologo.conteudo.service;

import com.acolher.psicologo.conteudo.dto.ArtigoDTO;
import com.acolher.psicologo.conteudo.dto.CriarArtigoDTO;
import com.acolher.psicologo.conteudo.dto.CriarPodcastDTO;
import com.acolher.psicologo.conteudo.dto.PodcastDTO;
import com.acolher.psicologo.conteudo.entity.Artigo;
import com.acolher.psicologo.conteudo.entity.Podcast;
import com.acolher.psicologo.conteudo.repository.ArtigoRepository;
import com.acolher.psicologo.conteudo.repository.PodcastRepository;
import com.acolher.psicologo.shared.exception.RecursoNaoEncontradoException;
import com.acolher.psicologo.usuario.Usuario;
import com.acolher.psicologo.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConteudoService {

    private final ArtigoRepository artigoRepository;
    private final PodcastRepository podcastRepository;
    private final UsuarioRepository usuarioRepository;

    // --- Artigos ---

    @Transactional(readOnly = true)
    public List<ArtigoDTO> listarArtigos(String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return artigoRepository.findByStatusAndCategoriaContainingIgnoreCaseOrderByPublicadoEmDesc("PUBLICADO", categoria)
                    .stream().map(ArtigoDTO::de).toList();
        }
        return artigoRepository.findByStatusOrderByPublicadoEmDesc("PUBLICADO")
                .stream().map(ArtigoDTO::de).toList();
    }

    @Transactional(readOnly = true)
    public ArtigoDTO buscarArtigoPorId(Integer id) {
        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artigo não encontrado"));
        return ArtigoDTO.de(artigo);
    }

    @Transactional
    public ArtigoDTO criarArtigo(String emailAutor, CriarArtigoDTO dto) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autor não encontrado"));

        Artigo artigo = new Artigo(
                autor,
                dto.titulo(),
                dto.resumo(),
                dto.corpo(),
                dto.categoria(),
                dto.imagemCapa(),
                dto.status()
        );
        return ArtigoDTO.de(artigoRepository.save(artigo));
    }

    @Transactional
    public ArtigoDTO atualizarArtigo(String emailAutor, Integer id, CriarArtigoDTO dto) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autor não encontrado"));

        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artigo não encontrado"));

        if (!artigo.getAutor().getId().equals(autor.getId())) {
            throw new AccessDeniedException("Você só pode editar seus próprios artigos.");
        }

        artigo.setTitulo(dto.titulo());
        artigo.setResumo(dto.resumo());
        artigo.setCorpo(dto.corpo());
        if (dto.categoria() != null) artigo.setCategoria(dto.categoria());
        if (dto.imagemCapa() != null) artigo.setImagemCapa(dto.imagemCapa());
        if (dto.status() != null) artigo.setStatus(dto.status());

        return ArtigoDTO.de(artigoRepository.save(artigo));
    }

    @Transactional
    public void excluirArtigo(String emailAutor, Integer id) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autor não encontrado"));

        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artigo não encontrado"));

        if (!artigo.getAutor().getId().equals(autor.getId())) {
            throw new AccessDeniedException("Você só pode excluir seus próprios artigos.");
        }
        artigoRepository.delete(artigo);
    }

    // --- Podcasts ---

    @Transactional(readOnly = true)
    public List<PodcastDTO> listarPodcasts(String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return podcastRepository.findByCategoriaContainingIgnoreCaseOrderByCriadoEmDesc(categoria)
                    .stream().map(PodcastDTO::de).toList();
        }
        return podcastRepository.findAllByOrderByCriadoEmDesc()
                .stream().map(PodcastDTO::de).toList();
    }

    @Transactional
    public PodcastDTO criarPodcast(String emailAutor, CriarPodcastDTO dto) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autor não encontrado"));

        Podcast podcast = new Podcast(
                autor,
                dto.titulo(),
                dto.descricao(),
                dto.urlAudio(),
                dto.duracaoSegundos(),
                dto.categoria(),
                dto.imagemCapa()
        );
        return PodcastDTO.de(podcastRepository.save(podcast));
    }

    @Transactional
    public void excluirPodcast(String emailAutor, Integer id) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Autor não encontrado"));

        Podcast podcast = podcastRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Podcast não encontrado"));

        if (!podcast.getAutor().getId().equals(autor.getId())) {
            throw new AccessDeniedException("Você só pode excluir seus próprios podcasts.");
        }
        podcastRepository.delete(podcast);
    }
}

