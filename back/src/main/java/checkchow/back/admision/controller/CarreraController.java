package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Carrera;
import checkchow.back.admision.service.CarreraService;

@RestController
@RequestMapping("/api/carrera")
@RequiredArgsConstructor
public class CarreraController {

    private final
    CarreraService carreraService;

    @GetMapping
    public ResponseEntity<
            List<Carrera>>
    listar() {

        return ResponseEntity.ok(
                carreraService
                        .listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<
            Carrera>
    obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                carreraService
                        .obtener(id));
    }

    @PostMapping
    public ResponseEntity<
            Carrera>
    crear(
            @RequestBody
            Carrera carrera) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        carreraService
                                .crear(
                                        carrera));
    }

    @PutMapping("/{id}")
    public ResponseEntity<
            Carrera>
    actualizar(
            @PathVariable Integer id,
            @RequestBody
            Carrera carrera) {

        return ResponseEntity.ok(
                carreraService
                        .actualizar(
                                id,
                                carrera));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminar(
            @PathVariable Integer id) {

        carreraService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}