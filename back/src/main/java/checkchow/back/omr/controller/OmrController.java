package checkchow.back.omr.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import checkchow.back.omr.dto.OmrIdentificacionImportDTO;
import checkchow.back.omr.dto.OmrImportResponse;
import checkchow.back.omr.dto.OmrRespuestaImportDTO;
import checkchow.back.omr.dto.OmrUnionResponse;
import checkchow.back.omr.service.OmrService;

@RestController
@RequestMapping("/api/omr")
@RequiredArgsConstructor

public class OmrController {

    private final OmrService omrService;

    @PostMapping("/identificaciones/import")
    public ResponseEntity<OmrImportResponse> importarIdentificaciones(
            @RequestParam(required = false) Integer procesoId,
            @RequestBody List<OmrIdentificacionImportDTO> rows) {

        return ResponseEntity.ok(
                omrService.importarIdentificaciones(procesoId, rows));
    }

    @PostMapping("/respuestas/import")
    public ResponseEntity<OmrImportResponse> importarRespuestas(
            @RequestParam(required = false) Integer procesoId,
            @RequestBody List<OmrRespuestaImportDTO> rows) {

        return ResponseEntity.ok(
                omrService.importarRespuestas(procesoId, rows));
    }

    @PostMapping("/union/{lithocode}")
    public ResponseEntity<OmrUnionResponse> crearUnion(
            @PathVariable String lithocode) {

        OmrUnionResponse union = omrService.crearUnion(lithocode);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(union);
    }

    @GetMapping("/union/{lithocode}")
    public ResponseEntity<OmrUnionResponse> obtenerUnion(
            @PathVariable String lithocode) {

        OmrUnionResponse union = omrService.obtenerUnion(lithocode);

        return ResponseEntity.ok(union);
    }
}
