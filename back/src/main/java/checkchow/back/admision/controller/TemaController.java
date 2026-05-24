package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Tema;
import checkchow.back.admision.service.TemaService;

@RestController
@RequestMapping("/api/tema")
@RequiredArgsConstructor
public class TemaController {

    private final
    TemaService temaService;

    @GetMapping
    public ResponseEntity<
            List<Tema>>
    listar() {

        return ResponseEntity.ok(
                temaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<
            Tema>
    obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                temaService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<
            Tema>
    crear(
            @RequestBody
            Tema tema) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        temaService
                                .crear(
                                        tema));
    }

    @PutMapping("/{id}")
    public ResponseEntity<
            Tema>
    actualizar(
            @PathVariable Integer id,
            @RequestBody Tema tema) {

        return ResponseEntity.ok(
                temaService
                        .actualizar(
                                id,
                                tema));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminar(
            @PathVariable Integer id) {

        temaService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}