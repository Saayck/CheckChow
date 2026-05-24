package checkchow.back.seguridad.controller;

import checkchow.back.seguridad.dto.AuditoriaRequest;
import checkchow.back.seguridad.dto.AuditoriaResponse;
import checkchow.back.seguridad.service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @PostMapping
    public ResponseEntity<AuditoriaResponse> registrar(@RequestBody AuditoriaRequest request,
                                                       HttpServletRequest httpRequest) {
        return ResponseEntity.ok(auditoriaService.registrar(request, httpRequest));
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaResponse>> listar() {
        return ResponseEntity.ok(auditoriaService.listar());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AuditoriaResponse>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(auditoriaService.listarPorUsuario(usuarioId));
    }
}
