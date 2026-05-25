package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ClaveRespuesta;
import checkchow.back.admision.repository.ClaveRespuestaRepository;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;
import checkchow.back.user.Usuario;

@Service
@RequiredArgsConstructor
@Transactional
public class ClaveRespuestaService {

    private final
    ClaveRespuestaRepository
            claveRespuestaRepository;

    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final AuditoriaService auditoriaService;

    public List<ClaveRespuesta>
    listar() {

        return claveRespuestaRepository
                .findAll();
    }

    public ClaveRespuesta
    obtener(
            Integer id) {

        return claveRespuestaRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Clave no encontrada"));
    }

    public ClaveRespuesta
    crear(
            ClaveRespuesta clave) {

        if (claveRespuestaRepository
                .findByTemaIdAndNroPregunta(
                        clave.getTema().getId(),
                        clave.getNroPregunta())
                .isPresent()) {

            throw new RuntimeException(
                    "Pregunta ya registrada en el tema");
        }

        clave.setFechaCreacion(
                OffsetDateTime.now());

        clave.setFechaModificacion(
                OffsetDateTime.now());

        Usuario usuario = usuarioAutenticadoService.obtenerActual();
        clave.setCreadoPor(usuario);

        ClaveRespuesta guardada = claveRespuestaRepository.save(clave);
        auditoriaService.registrarEvento(usuario, null, TAccion.CREATE, TMetodoHttp.POST,
                "/api/clave-respuesta", "clave_respuesta", String.valueOf(guardada.getId()),
                snapshot(guardada), null);
        return guardada;
    }

    public ClaveRespuesta
    actualizar(
            Integer id,
            ClaveRespuesta data) {

        ClaveRespuesta clave = obtener(id);
        String valorAnterior = snapshot(clave);

        clave.setTema(
                data.getTema());

        clave.setNroPregunta(
                data.getNroPregunta());

        clave.setRespuestaCorrecta(
                data.getRespuestaCorrecta());

        clave.setFormula(
                data.getFormula());

        if (clave.getCreadoPor() == null) {
            clave.setCreadoPor(
                    usuarioAutenticadoService.obtenerActual());
        }

        clave.setFechaModificacion(
                OffsetDateTime.now());

        ClaveRespuesta guardada = claveRespuestaRepository.save(clave);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.UPDATE, TMetodoHttp.PUT, "/api/clave-respuesta/" + id,
                "clave_respuesta", String.valueOf(id), valorAnterior, snapshot(guardada), null);
        return guardada;
    }

    public void eliminar(
            Integer id) {

        ClaveRespuesta clave =
                obtener(id);

        String valorAnterior = snapshot(clave);

        claveRespuestaRepository.delete(clave);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.DELETE, TMetodoHttp.DELETE, "/api/clave-respuesta/" + id,
                "clave_respuesta", String.valueOf(id), valorAnterior,
                auditoriaService.toJson(Map.of("accion", "CLAVE_RESPUESTA_ELIMINADA", "id", id)), null);
    }

    private String snapshot(ClaveRespuesta clave) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", clave.getId());
        data.put("temaId", clave.getTema() != null ? clave.getTema().getId() : null);
        data.put("nroPregunta", clave.getNroPregunta());
        data.put("respuestaCorrecta", clave.getRespuestaCorrecta());
        data.put("formula", clave.getFormula());
        data.put("creadoPorId", clave.getCreadoPor() != null ? clave.getCreadoPor().getId() : null);
        data.put("fechaCreacion", clave.getFechaCreacion());
        data.put("fechaModificacion", clave.getFechaModificacion());
        return auditoriaService.toJson(data);
    }
}
