package com.acolher.psicologo.especialista.controller;

import com.acolher.psicologo.especialista.dto.DadosEspecialistaDTO;
import com.acolher.psicologo.especialista.service.EspecialistaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Especialistas", description = "Listagem e cadastro de psicólogos e especialistas para atendimento")
@RestController
@RequestMapping({"/especialistas", "/api/especialistas"})
@RequiredArgsConstructor
public class EspecialistaController {

    private final EspecialistaService service;

    @Operation(summary = "Lista todos os psicólogos/especialistas disponíveis para atendimento")
    @GetMapping
    public ResponseEntity<List<DadosEspecialistaDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @Operation(summary = "Cadastra ou atualiza o perfil do especialista")
    @PostMapping
    public ResponseEntity<DadosEspecialistaDTO> salvarPerfil(@RequestBody Map<String, Object> dados) {
        Integer usuarioId = dados.get("usuarioId") != null ? Integer.parseInt(dados.get("usuarioId").toString()) : null;
        if (usuarioId == null) {
            return ResponseEntity.badRequest().build();
        }
        String nome = (String) dados.get("nomeCompleto");
        String crp = (String) dados.get("crm");
        if (crp == null) crp = (String) dados.get("crp");
        String credenciais = (String) dados.get("credenciais");
        String especialidade = (String) dados.get("especialidade");
        String biografia = (String) dados.get("biografia");
        Boolean disponivel = dados.get("disponivel") != null ? Boolean.parseBoolean(dados.get("disponivel").toString()) : true;

        DadosEspecialistaDTO dto = service.salvarPerfilProfissional(usuarioId, nome, crp, credenciais, especialidade, biografia, disponivel);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
