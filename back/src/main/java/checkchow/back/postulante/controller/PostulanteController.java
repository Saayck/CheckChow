package checkchow.back.postulante.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import checkchow.back.postulante.dto.PostulanteImportDTO;
import checkchow.back.postulante.entity.Postulante;
import checkchow.back.postulante.service.PostulanteService;

@RestController
@RequestMapping("/api/postulante")
@RequiredArgsConstructor
public class PostulanteController {

        private final PostulanteService postulanteService;

        @GetMapping
        public ResponseEntity<List<Postulante>> listar() {

                return ResponseEntity.ok(
                                postulanteService.listar());
        }

        @GetMapping("/{id}")
        public ResponseEntity<Postulante> obtener(
                        @PathVariable Integer id) {

                return ResponseEntity.ok(
                                postulanteService.obtener(id));
        }

        @PostMapping
        public ResponseEntity<Postulante> crear(
                        @RequestBody Postulante postulante) {

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                postulanteService.crear(
                                                                postulante));
        }

        @PutMapping("/{id}")
        public ResponseEntity<Postulante> actualizar(
                        @PathVariable Integer id,
                        @RequestBody Postulante postulante) {

                return ResponseEntity.ok(
                                postulanteService.actualizar(
                                                id,
                                                postulante));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(
                        @PathVariable Integer id) {

                postulanteService.eliminar(id);

                return ResponseEntity.noContent().build();
        }

        @PostMapping("/import")
        public ResponseEntity<List<Postulante>> importar(
                        @RequestBody List<PostulanteImportDTO> rows) {

                return ResponseEntity.ok(
                                postulanteService.importar(rows));
        }
}