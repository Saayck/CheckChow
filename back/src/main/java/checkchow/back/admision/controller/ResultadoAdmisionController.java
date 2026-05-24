package checkchow.back.admision.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ResultadoAdmision;
import checkchow.back.admision.service.ResultadoAdmisionService;

@RestController
@RequestMapping("/api/resultado-admision")
@RequiredArgsConstructor
public class ResultadoAdmisionController {

    private final
    ResultadoAdmisionService
            resultadoService;

    @GetMapping
    public ResponseEntity<
            List<ResultadoAdmision>>
    listar() {

        return ResponseEntity.ok(
                resultadoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<
            ResultadoAdmision>
    obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                resultadoService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<
            ResultadoAdmision>
    crear(
            @RequestBody
            ResultadoAdmision resultado) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        resultadoService
                                .crear(
                                        resultado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<
            ResultadoAdmision>
    actualizar(
            @PathVariable Integer id,
            @RequestBody
            ResultadoAdmision resultado) {

        return ResponseEntity.ok(
                resultadoService
                        .actualizar(
                                id,
                                resultado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminar(
            @PathVariable Integer id) {

        resultadoService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}