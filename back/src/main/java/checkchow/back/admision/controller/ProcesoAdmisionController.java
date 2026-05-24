package checkchow.back.admision.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.service.ProcesoAdmisionService;

@RestController
@RequestMapping("/api/proceso-admision")
@RequiredArgsConstructor
public class ProcesoAdmisionController {

    private final ProcesoAdmisionService procesoService;

    @GetMapping
    public ResponseEntity<List<ProcesoAdmision>> listar() {

        return ResponseEntity.ok(procesoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcesoAdmision> obtener(@PathVariable Integer id) {

        return ResponseEntity.ok(procesoService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<ProcesoAdmision> crear(@RequestBody ProcesoAdmision proceso) {

        return ResponseEntity.status(HttpStatus.CREATED).body(procesoService.crear(proceso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcesoAdmision> actualizar(@PathVariable Integer id, @RequestBody ProcesoAdmision proceso) {

        return ResponseEntity.ok(procesoService.actualizar(id, proceso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {

        procesoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}