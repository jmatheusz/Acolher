package com.acolher.psicologo.usuario;

import com.acolher.psicologo.usuario.dto.AtualizacaoPerfil;
import com.acolher.psicologo.usuario.dto.DadosUsuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Perfil", description = "Dados do usuario autenticado")
@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class PerfilController {

    private final UsuarioService service;

    @Operation(summary = "Retorna o perfil do usuario autenticado")
    @GetMapping
    public ResponseEntity<DadosUsuario> perfil(@AuthenticationPrincipal UserDetails autenticado) {
        return ResponseEntity.ok(service.buscarPorEmail(autenticado.getUsername()));
    }

    @Operation(summary = "Atualiza o perfil do usuario autenticado")
    @PatchMapping
    public ResponseEntity<DadosUsuario> atualizar(@AuthenticationPrincipal UserDetails autenticado,
                                                  @RequestBody @Valid AtualizacaoPerfil dados) {
        return ResponseEntity.ok(service.atualizarPerfil(autenticado.getUsername(), dados));
    }
}
