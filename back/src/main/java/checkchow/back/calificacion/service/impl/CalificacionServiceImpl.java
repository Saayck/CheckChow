package checkchow.back.calificacion.service.impl;

import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;
import checkchow.back.calificacion.dto.CalificacionRequestDTO;
import checkchow.back.calificacion.dto.CalificacionResponseDTO;
import checkchow.back.calificacion.entity.Calificacion;
import checkchow.back.calificacion.entity.ConfigPuntaje;
import checkchow.back.calificacion.repository.CalificacionRepository;
import checkchow.back.calificacion.repository.ConfigPuntajeRepository;
import checkchow.back.calificacion.service.CalificacionService;
import checkchow.back.postulante.entity.FichaAlumno;
import checkchow.back.postulante.repository.FichaAlumnoRepository;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime; // Usando tu actualización
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalificacionServiceImpl implements CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final ConfigPuntajeRepository configPuntajeRepository;
    private final FichaAlumnoRepository fichaAlumnoRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public CalificacionResponseDTO calcularYGuardarCalificacion(Integer fichaId, Integer procesoId, String emailUsuario, CalificacionRequestDTO request) {

        // 1. Validar existencias
        FichaAlumno ficha = fichaAlumnoRepository.findById(fichaId)
                .orElseThrow(() -> new RuntimeException("Ficha de alumno no encontrada"));
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new RuntimeException("Proceso no encontrado"));
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + emailUsuario));

        // 2. Obtener la configuración de puntajes del proceso
        ConfigPuntaje config = configPuntajeRepository.findByProcesoId(procesoId)
                .orElseThrow(() -> new RuntimeException("Debe configurar los puntajes del proceso antes de calificar"));

        // 3. Buscar si la ficha ya tiene calificación (Upsert)
        boolean esRecalculo = true;
        Calificacion calificacion = calificacionRepository.findByFichaId(fichaId)
                .orElseGet(() -> {
                    Calificacion nueva = new Calificacion();
                    nueva.setFicha(ficha);
                    nueva.setProceso(proceso);
                    nueva.setCalificadoEn(LocalDateTime.now()); // Inicializado como LocalDateTime
                    return nueva;
                });

        if (calificacion.getId() == null) esRecalculo = false; // Si es nueva, no es recalculo

        // 4. Asignar conteos del OMR
        calificacion.setCorrectas(request.correctas());
        calificacion.setIncorrectas(request.incorrectas());
        calificacion.setEnBlanco(request.enBlanco());
        calificacion.setAnuladas(request.anuladas());

        // 5. Cálculos matemáticos exactos con BigDecimal
        BigDecimal totalCorrectas = config.getPuntajeCorrecto().multiply(BigDecimal.valueOf(request.correctas()));
        BigDecimal totalIncorrectas = config.getPuntajeIncorrecto().multiply(BigDecimal.valueOf(request.incorrectas()));
        BigDecimal totalBlanco = config.getPuntajeBlanco().multiply(BigDecimal.valueOf(request.enBlanco()));
        BigDecimal totalAnuladas = config.getPuntajeAnulado().multiply(BigDecimal.valueOf(request.anuladas()));

        BigDecimal puntajeBruto = totalCorrectas.add(totalIncorrectas).add(totalBlanco).add(totalAnuladas);
        BigDecimal puntajeFinal = puntajeBruto.add(config.getPuntajeBase());

        calificacion.setPuntajeBruto(puntajeBruto);
        calificacion.setPuntajeFinal(puntajeFinal);

        // 6. Auditoría
        calificacion.setCalificadoPor(usuario);
        if (esRecalculo) {
            calificacion.setRecalculadoEn(LocalDateTime.now());
        }

        // 7. Guardar y mapear a DTO
        Calificacion guardada = calificacionRepository.save(calificacion);
        return mapearADto(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public CalificacionResponseDTO obtenerPorFicha(Integer fichaId) {
        Calificacion calificacion = calificacionRepository.findByFichaId(fichaId)
                .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));
        return mapearADto(calificacion);
    }

    @Override
    @Transactional
    public List<CalificacionResponseDTO> recalcularPorProceso(Integer procesoId, String emailUsuario) {

        List<Calificacion> calificaciones = calificacionRepository.findByProcesoId(procesoId);

        return calificaciones.stream().map(cal -> {
            CalificacionRequestDTO request = new CalificacionRequestDTO(
                    cal.getCorrectas(), cal.getIncorrectas(), cal.getEnBlanco(), cal.getAnuladas()
            );
            return calcularYGuardarCalificacion(cal.getFicha().getId(), procesoId, emailUsuario, request);
        }).collect(Collectors.toList());
    }

    private CalificacionResponseDTO mapearADto(Calificacion entity) {
        CalificacionResponseDTO dto = new CalificacionResponseDTO();
        dto.setId(entity.getId());
        dto.setFichaId(entity.getFicha().getId());
        dto.setProcesoId(entity.getProceso().getId());
        dto.setCorrectas(entity.getCorrectas());
        dto.setIncorrectas(entity.getIncorrectas());
        dto.setEnBlanco(entity.getEnBlanco());
        dto.setAnuladas(entity.getAnuladas());
        dto.setPuntajeBruto(entity.getPuntajeBruto());
        dto.setPuntajeFinal(entity.getPuntajeFinal());

        if (entity.getCalificadoPor() != null) {
            dto.setNombreCalificador(entity.getCalificadoPor().getNombreCompleto());
        }

        dto.setCalificadoEn(entity.getCalificadoEn());
        dto.setRecalculadoEn(entity.getRecalculadoEn());
        return dto;
    }
}