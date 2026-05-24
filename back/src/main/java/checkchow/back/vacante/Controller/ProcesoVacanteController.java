package checkchow.back.vacante.Controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.vacante.Service.ProcesoVacanteService;
import checkchow.back.vacante.entity.ProcesoVacante;

@RestController
@RequestMapping("/api/vacante")
@RequiredArgsConstructor
public class ProcesoVacanteController {

    private final ProcesoVacanteService procesoVacanteService;

    @GetMapping
    public ResponseEntity<List<ProcesoVacante>> listar() {

        return ResponseEntity.ok(
                procesoVacanteService
                        .listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcesoVacante> obtener(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                procesoVacanteService
                        .obtener(id));
    }

    @PostMapping
    public ResponseEntity<ProcesoVacante> crear(
            @RequestBody ProcesoVacante vacante) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED)
                .body(
                        procesoVacanteService
                                .crear(
                                        vacante));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcesoVacante> actualizar(
            @PathVariable Integer id,
            @RequestBody ProcesoVacante vacante) {

        return ResponseEntity.ok(
                procesoVacanteService
                        .actualizar(
                                id,
                                vacante));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id) {

        procesoVacanteService
                .eliminar(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}