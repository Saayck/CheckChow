package checkchow.back.calificacion.controller;

import checkchow.back.calificacion.dto.CalificacionRequestDTO;
import checkchow.back.calificacion.dto.CalificacionResponseDTO;
import checkchow.back.calificacion.service.CalificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calificaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true") // Añadido para evitar tu problema de CORS anterior
public class CalificacionController {

    private final CalificacionService calificacionService;

    /**
     * Calcula y guarda (o actualiza) la calificación de una ficha escaneada por el OMR.
     * POST /api/calificaciones/ficha/{fichaId}/proceso/{procesoId}
     */
    @PostMapping("/ficha/{fichaId}/proceso/{procesoId}")
    public ResponseEntity<CalificacionResponseDTO> calcularYGuardar(
            @PathVariable Integer fichaId,
            @PathVariable Integer procesoId,
            @RequestBody CalificacionRequestDTO request) {

        try {
            // 1. Extraemos el email del usuario desde el token JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String emailUsuario = authentication.getName();

            // 2. Pasamos el email en lugar del ID
            CalificacionResponseDTO response = calificacionService.calcularYGuardarCalificacion(fichaId, procesoId, emailUsuario, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtiene la calificación final de una ficha de alumno específica.
     * GET /api/calificaciones/ficha/{fichaId}
     */
    @GetMapping("/ficha/{fichaId}")
    public ResponseEntity<CalificacionResponseDTO> obtenerPorFicha(@PathVariable Integer fichaId) {
        try {
            CalificacionResponseDTO response = calificacionService.obtenerPorFicha(fichaId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Recalcula los puntajes de todas las fichas pertenecientes a un proceso de admisión.
     * POST /api/calificaciones/proceso/{procesoId}/recalcular
     */
    @PostMapping("/proceso/{procesoId}/recalcular")
    public ResponseEntity<List<CalificacionResponseDTO>> recalcularPorProceso(
            @PathVariable Integer procesoId) {

        try {
            // 1. Extraemos el email del administrador que está pidiendo recalcular
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String emailUsuario = authentication.getName();

            // 2. Pasamos el email al servicio
            List<CalificacionResponseDTO> respuestasActualizadas = calificacionService.recalcularPorProceso(procesoId, emailUsuario);
            return ResponseEntity.ok(respuestasActualizadas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}