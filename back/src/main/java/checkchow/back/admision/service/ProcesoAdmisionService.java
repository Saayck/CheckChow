package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;
import checkchow.back.user.Usuario;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcesoAdmisionService {

    private final
    ProcesoAdmisionRepository
            procesoRepository;

    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final AuditoriaService auditoriaService;

    public List<ProcesoAdmision>
    listar() {

        return procesoRepository
                .findAll();
    }

    public ProcesoAdmision
    obtener(
            Integer id) {

        return procesoRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Proceso no encontrado"));
    }

    public ProcesoAdmision
    crear(
            ProcesoAdmision proceso) {

        if (procesoRepository
                .findByCodigo(
                        proceso.getCodigo())
                .isPresent()) {

            throw new RuntimeException(
                    "Código ya registrado");
        }

        if (procesoRepository
                .findByAnioAndPeriodo(
                        proceso.getAnio(),
                        proceso.getPeriodo())
                .isPresent()) {

            throw new RuntimeException(
                    "Proceso ya existe para año y periodo");
        }

        proceso.setFechaCreacion(
                OffsetDateTime.now());

        proceso.setFechaModificacion(
                OffsetDateTime.now());

        Usuario usuario = usuarioAutenticadoService.obtenerActual();
        proceso.setCreadoPor(usuario);

        ProcesoAdmision guardado = procesoRepository.save(proceso);
        auditoriaService.registrarEvento(usuario, null, TAccion.CREATE, TMetodoHttp.POST,
                "/api/proceso-admision", "proceso_admision", String.valueOf(guardado.getId()),
                snapshot(guardado), null);
        return guardado;
    }

    public ProcesoAdmision
    actualizar(
            Integer id,
            ProcesoAdmision data) {

        ProcesoAdmision proceso = obtener(id);
        String valorAnterior = snapshot(proceso);

        proceso.setCodigo(
                data.getCodigo());

        proceso.setAnio(
                data.getAnio());

        proceso.setPeriodo(
                data.getPeriodo());

        proceso.setDescription(
                data.getDescription());

        proceso.setTipoProcesoAdmision(
                data.getTipoProcesoAdmision());

        proceso.setFechaExamen(
                data.getFechaExamen());

        proceso.setEstado(
                data.getEstado());

        if (proceso.getCreadoPor() == null) {
            proceso.setCreadoPor(
                    usuarioAutenticadoService.obtenerActual());
        }

        proceso.setFechaModificacion(
                OffsetDateTime.now());

        ProcesoAdmision guardado = procesoRepository.save(proceso);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.UPDATE, TMetodoHttp.PUT, "/api/proceso-admision/" + id,
                "proceso_admision", String.valueOf(id), valorAnterior, snapshot(guardado), null);
        return guardado;
    }

    public void eliminar(
            Integer id) {

        ProcesoAdmision proceso =
                obtener(id);

        String valorAnterior = snapshot(proceso);

        procesoRepository.delete(proceso);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.DELETE, TMetodoHttp.DELETE, "/api/proceso-admision/" + id,
                "proceso_admision", String.valueOf(id), valorAnterior,
                auditoriaService.toJson(Map.of("accion", "PROCESO_ADMISION_ELIMINADO", "id", id)), null);
    }

    private String snapshot(ProcesoAdmision proceso) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", proceso.getId());
        data.put("codigo", proceso.getCodigo());
        data.put("anio", proceso.getAnio());
        data.put("periodo", proceso.getPeriodo());
        data.put("descripcion", proceso.getDescription());
        data.put("tipoProcesoAdmision", proceso.getTipoProcesoAdmision());
        data.put("fechaExamen", proceso.getFechaExamen());
        data.put("estado", proceso.getEstado());
        data.put("creadoPorId", proceso.getCreadoPor() != null ? proceso.getCreadoPor().getId() : null);
        data.put("fechaCreacion", proceso.getFechaCreacion());
        data.put("fechaModificacion", proceso.getFechaModificacion());
        return auditoriaService.toJson(data);
    }
}
