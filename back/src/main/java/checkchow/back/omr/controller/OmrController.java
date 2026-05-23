package checkchow.back.omr.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import checkchow.back.omr.entity.OmrUnion;
import checkchow.back.omr.service.OmrService;

@RestController
@RequestMapping("/api/omr")
@RequiredArgsConstructor

public class OmrController {

    private final OmrService omrService;

    @PostMapping("/union/{lithocode}")
    public ResponseEntity<OmrUnion> crearUnion(
            @PathVariable String lithocode) {

        OmrUnion union = omrService.crearUnion(lithocode);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(union);
    }

    @GetMapping("/union/{lithocode}")
    public ResponseEntity<OmrUnion> obtenerUnion(
            @PathVariable String lithocode) {

        OmrUnion union = omrService.obtenerUnion(lithocode);

        return ResponseEntity.ok(union);
    }
}