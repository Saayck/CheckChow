package checkchow.back.calificacion.controller;

import checkchow.back.calificacion.dto.ConfigPuntajeRequestDTO;
import checkchow.back.calificacion.entity.ConfigPuntaje;
import checkchow.back.calificacion.service.ConfigPuntajeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config-puntaje")
@RequiredArgsConstructor

public class ConfigPuntajeController {

    private final ConfigPuntajeService configPuntajeService;

    /**
     * Obtiene la configuración de puntaje actual para un proceso de admisión específico.
     * GET /api/config-puntaje/proceso/{procesoId}
     */
    @GetMapping("/proceso/{procesoId}")
    public ResponseEntity<ConfigPuntaje> obtenerConfiguracion(@PathVariable Integer procesoId) {
        try {
            ConfigPuntaje config = configPuntajeService.obtenerConfiguracionActual(procesoId);
            return ResponseEntity.ok(config);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Guarda o actualiza los parámetros de la configuración de puntaje.
     * PUT /api/config-puntaje/proceso/{procesoId}
     */
    @PutMapping("/proceso/{procesoId}")
    public ResponseEntity<ConfigPuntaje> guardarOActualizarConfiguracion(
        @PathVariable Integer procesoId, @RequestBody ConfigPuntajeRequestDTO requestDTO) {

        // Extraemos el email/username del token JWT validado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuario = authentication.getName();

        // Pasamos el email en lugar del ID
        ConfigPuntaje configActualizada = configPuntajeService.guardarOActualizarConfiguracion(procesoId, emailUsuario, requestDTO);
        return ResponseEntity.ok(configActualizada);
    }

    /**
     * Restaura los valores por defecto del sistema para un proceso en específico.
     * POST /api/config-puntaje/proceso/{procesoId}/restaurar
     */
    @PostMapping("/proceso/{procesoId}/restaurar")
    public ResponseEntity<ConfigPuntaje> restaurarPorDefecto(@PathVariable Integer procesoId) {

        // Extraemos de forma segura la identidad desde el token validado por Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuario = authentication.getName();

        ConfigPuntaje response = configPuntajeService.restaurarPorDefecto(procesoId, emailUsuario);
        return ResponseEntity.ok(response);
    }
}