package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Inscripcion;
import checkchow.back.admision.service.InscripcionService;

@RestController
@RequestMapping("/api/inscripcion")
@RequiredArgsConstructor
public class InscripcionController {

    private final
    InscripcionService
            inscripcionService;

    @GetMapping
    public ResponseEntity<
            List<Inscripcion>>
    listar() {

        return ResponseEntity.ok(
                inscripcionService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<
            Inscripcion>
    obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                inscripcionService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<
            Inscripcion>
    crear(
            @RequestBody
            Inscripcion inscripcion) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        inscripcionService
                                .crear(
                                        inscripcion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<
            Inscripcion>
    actualizar(
            @PathVariable Integer id,
            @RequestBody
            Inscripcion inscripcion) {

        return ResponseEntity.ok(
                inscripcionService
                        .actualizar(
                                id,
                                inscripcion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminar(
            @PathVariable Integer id) {

        inscripcionService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}