package checkchow.back.calificacion.service.impl;

import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;
import checkchow.back.calificacion.dto.ConfigPuntajeRequestDTO;
import checkchow.back.calificacion.entity.ConfigPuntaje;
import checkchow.back.calificacion.repository.ConfigPuntajeRepository;
import checkchow.back.calificacion.service.ConfigPuntajeService;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ConfigPuntajeServiceImpl implements ConfigPuntajeService {

    private final ConfigPuntajeRepository configPuntajeRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public ConfigPuntaje guardarOActualizarConfiguracion(Integer procesoId, String emailUsuario, ConfigPuntajeRequestDTO request) {

        // 1. Validar que el proceso y el usuario existan
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new RuntimeException("Proceso de admisión no encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Buscar si ya existe una configuración, si no, crear una nueva instancia
        ConfigPuntaje config = configPuntajeRepository.findByProcesoId(procesoId)
                .orElseGet(() -> {
                    ConfigPuntaje nuevaConfig = new ConfigPuntaje();
                    nuevaConfig.setProceso(proceso);
                    // Los valores 'anulado' y base se mantienen en ZERO por defecto según el entity
                    nuevaConfig.setPuntajeAnulado(BigDecimal.ZERO);
                    nuevaConfig.setPuntajeBase(BigDecimal.ZERO);
                    return nuevaConfig;
                });

        // 3. Actualizar los valores provenientes del DTO
        config.setPuntajeCorrecto(request.puntajeCorrecto());
        config.setPuntajeIncorrecto(request.puntajeIncorrecto());
        config.setPuntajeBlanco(request.puntajeBlanco());

        // 4. Actualizar datos de auditoría
        config.setModificadoPor(usuario);
        config.setFechaModificacion(LocalDateTime.now());

        // 5. Guardar en base de datos
        return configPuntajeRepository.save(config);
    }

    @Override
    @Transactional
    public ConfigPuntaje restaurarPorDefecto(Integer procesoId, String emailUsuario) {

        ConfigPuntajeRequestDTO valoresPorDefecto = new ConfigPuntajeRequestDTO(
                new BigDecimal("20.0000"),
                new BigDecimal("-1.1250"),
                BigDecimal.ZERO
        );

        return guardarOActualizarConfiguracion(procesoId, emailUsuario, valoresPorDefecto);
    }

    @Override
    @Transactional(readOnly = true)
    public ConfigPuntaje obtenerConfiguracionActual(Integer procesoId) {
        return configPuntajeRepository.findByProcesoId(procesoId)
                .orElseThrow(() -> new RuntimeException("No hay configuración para este proceso"));
    }
}
