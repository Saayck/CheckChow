package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Facultad;
import checkchow.back.admision.service.FacultadService;

@RestController
@RequestMapping("/api/facultad")
@RequiredArgsConstructor
public class FacultadController {

    private final
    FacultadService
            facultadService;

    @GetMapping
    public ResponseEntity<
            List<Facultad>>
    listar() {

        return ResponseEntity.ok(
                facultadService
                        .listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<
            Facultad>
    obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                facultadService
                        .obtener(id));
    }

    @PostMapping
    public ResponseEntity<
            Facultad>
    crear(
            @RequestBody
            Facultad facultad) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        facultadService
                                .crear(
                                        facultad));
    }

    @PutMapping("/{id}")
    public ResponseEntity<
            Facultad>
    actualizar(
            @PathVariable Integer id,
            @RequestBody
            Facultad facultad) {

        return ResponseEntity.ok(
                facultadService
                        .actualizar(
                                id,
                                facultad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminar(
            @PathVariable Integer id) {

        facultadService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}