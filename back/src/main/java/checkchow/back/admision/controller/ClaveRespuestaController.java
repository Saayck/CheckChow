package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ClaveRespuesta;
import checkchow.back.admision.service.ClaveRespuestaService;

@RestController
@RequestMapping("/api/clave-respuesta")
@RequiredArgsConstructor
public class ClaveRespuestaController {

    private final ClaveRespuestaService claveRespuestaService;

    @GetMapping
    public ResponseEntity<List<ClaveRespuesta>> listar() {

        return ResponseEntity.ok(
                claveRespuestaService
                        .listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaveRespuesta> obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                claveRespuestaService
                        .obtener(id));
    }

    @PostMapping
    public ResponseEntity<ClaveRespuesta> crear(
            @RequestBody ClaveRespuesta clave) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        claveRespuestaService
                                .crear(clave));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClaveRespuesta> actualizar(
            @PathVariable Integer id,
            @RequestBody ClaveRespuesta clave) {

        return ResponseEntity.ok(
                claveRespuestaService
                        .actualizar(
                                id,
                                clave));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id) {

        claveRespuestaService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}