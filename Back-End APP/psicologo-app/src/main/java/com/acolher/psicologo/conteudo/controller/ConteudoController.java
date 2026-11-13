package com.acolher.psicologo.conteudo.controller;

import com.acolher.psicologo.conteudo.dto.ArtigoDTO;
import com.acolher.psicologo.conteudo.dto.CriarArtigoDTO;
import com.acolher.psicologo.conteudo.dto.CriarPodcastDTO;
import com.acolher.psicologo.conteudo.dto.PodcastDTO;
import com.acolher.psicologo.conteudo.service.ConteudoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Conteúdos & Apoio", description = "Artigos educativos e podcasts da Central de Apoio")
@RestController
@RequestMapping("/api/conteudos")
@RequiredArgsConstructor
public class ConteudoController {

    private final ConteudoService service;

    // --- Artigos ---
    @Operation(summary = "Lista artigos publicados (com filtro opcional por categoria)")
    @GetMapping("/artigos")
    public ResponseEntity<List<ArtigoDTO>> listarArtigos(@RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(service.listarArtigos(categoria));
    }

    @Operation(summary = "Busca artigo por ID")
    @GetMapping("/artigos/{id}")
    public ResponseEntity<ArtigoDTO> buscarArtigo(@PathVariable Integer id) {
        return ResponseEntity.ok(service.buscarArtigoPorId(id));
    }

    @Operation(summary = "Psicólogo publica novo artigo")
    @PostMapping("/artigos")
    public ResponseEntity<ArtigoDTO> criarArtigo(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarArtigoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarArtigo(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Psicólogo atualiza seu artigo")
    @PutMapping("/artigos/{id}")
    public ResponseEntity<ArtigoDTO> atualizarArtigo(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id,
            @RequestBody @Valid CriarArtigoDTO dto) {
        return ResponseEntity.ok(service.atualizarArtigo(autenticado.getUsername(), id, dto));
    }

    @Operation(summary = "Psicólogo exclui seu artigo")
    @DeleteMapping("/artigos/{id}")
    public ResponseEntity<Void> excluirArtigo(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.excluirArtigo(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // --- Podcasts ---
    @Operation(summary = "Lista episódios de podcasts disponíveis")
    @GetMapping("/podcasts")
    public ResponseEntity<List<PodcastDTO>> listarPodcasts(@RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(service.listarPodcasts(categoria));
    }

    @Operation(summary = "Psicólogo adiciona novo episódio de podcast")
    @PostMapping("/podcasts")
    public ResponseEntity<PodcastDTO> criarPodcast(
            @AuthenticationPrincipal UserDetails autenticado,
            @RequestBody @Valid CriarPodcastDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarPodcast(autenticado.getUsername(), dto));
    }

    @Operation(summary = "Psicólogo exclui seu episódio de podcast")
    @DeleteMapping("/podcasts/{id}")
    public ResponseEntity<Void> excluirPodcast(
            @AuthenticationPrincipal UserDetails autenticado,
            @PathVariable Integer id) {
        service.excluirPodcast(autenticado.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}

