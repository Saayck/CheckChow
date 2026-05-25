package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ResultadoAdmision;
import checkchow.back.admision.repository.ResultadoAdmisionRepository;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;
import checkchow.back.user.Usuario;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultadoAdmisionService {

    private final
    ResultadoAdmisionRepository
            resultadoRepository;

    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final AuditoriaService auditoriaService;

    public List<ResultadoAdmision>
    listar() {

        return resultadoRepository
                .findAll();
    }

    public ResultadoAdmision
    obtener(
            Integer id) {

        return resultadoRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resultado no encontrado"));
    }

    public ResultadoAdmision
    crear(
            ResultadoAdmision resultado) {

        if (resultadoRepository
                .findByInscripcionId(
                        resultado
                                .getInscripcion()
                                .getId())
                .isPresent()) {

            throw new RuntimeException(
                    "La inscripción ya tiene resultado");
        }

        if (resultadoRepository
                .findByCalificacionId(
                        resultado
                                .getCalificacion()
                                .getId())
                .isPresent()) {

            throw new RuntimeException(
                    "La calificación ya fue usada");
        }

        resultado.setGeneradoEn(
                OffsetDateTime.now());

        Usuario usuario = usuarioAutenticadoService.obtenerActualOUsuarioSistema();
        resultado.setGeneradoPor(usuario);

        if (Boolean.TRUE.equals(
                resultado.getPublicado())) {

            resultado.setFechaPublicacion(
                    OffsetDateTime.now());
        }

        ResultadoAdmision guardado = resultadoRepository.save(resultado);
        auditoriaService.registrarEvento(usuario, null, TAccion.CREATE, TMetodoHttp.POST,
                "/api/resultado-admision", "resultado_admision", String.valueOf(guardado.getId()),
                snapshot(guardado), null);
        return guardado;
    }

    public ResultadoAdmision
    actualizar(
            Integer id,
            ResultadoAdmision data) {

        ResultadoAdmision resultado = obtener(id);
        String valorAnterior = snapshot(resultado);

        resultado.setProceso(
                data.getProceso());

        resultado.setInscripcion(
                data.getInscripcion());

        resultado.setCalificacion(
                data.getCalificacion());

        resultado.setPuntajeFinal(
                data.getPuntajeFinal());

        resultado.setOrdenMerito(
                data.getOrdenMerito());

        resultado.setCondicion(
                data.getCondicion());

        resultado.setVacanteAmpliada(
                data.getVacanteAmpliada());

        resultado.setPublicado(
                data.getPublicado());

        if (Boolean.TRUE.equals(
                data.getPublicado())) {

            resultado.setFechaPublicacion(
                    OffsetDateTime.now());
        }

        if (resultado.getGeneradoPor() == null) {
            resultado.setGeneradoPor(
                    usuarioAutenticadoService.obtenerActualOUsuarioSistema());
        }

        ResultadoAdmision guardado = resultadoRepository.save(resultado);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.UPDATE, TMetodoHttp.PUT, "/api/resultado-admision/" + id,
                "resultado_admision", String.valueOf(id), valorAnterior, snapshot(guardado), null);
        return guardado;
    }

    public void eliminar(
            Integer id) {

        ResultadoAdmision resultado =
                obtener(id);

        String valorAnterior = snapshot(resultado);

        resultadoRepository.delete(resultado);
        auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                TAccion.DELETE, TMetodoHttp.DELETE, "/api/resultado-admision/" + id,
                "resultado_admision", String.valueOf(id), valorAnterior,
                auditoriaService.toJson(Map.of("accion", "RESULTADO_ADMISION_ELIMINADO", "id", id)), null);
    }

    private String snapshot(ResultadoAdmision resultado) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", resultado.getId());
        data.put("procesoId", resultado.getProceso() != null ? resultado.getProceso().getId() : null);
        data.put("inscripcionId", resultado.getInscripcion() != null ? resultado.getInscripcion().getId() : null);
        data.put("calificacionId", resultado.getCalificacion() != null ? resultado.getCalificacion().getId() : null);
        data.put("puntajeFinal", resultado.getPuntajeFinal());
        data.put("ordenMerito", resultado.getOrdenMerito());
        data.put("condicion", resultado.getCondicion());
        data.put("vacanteAmpliada", resultado.getVacanteAmpliada());
        data.put("publicado", resultado.getPublicado());
        data.put("fechaPublicacion", resultado.getFechaPublicacion());
        data.put("generadoPorId", resultado.getGeneradoPor() != null ? resultado.getGeneradoPor().getId() : null);
        data.put("generadoEn", resultado.getGeneradoEn());
        return auditoriaService.toJson(data);
    }
}
