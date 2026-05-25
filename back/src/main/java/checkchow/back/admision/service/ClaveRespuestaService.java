package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ClaveRespuesta;
import checkchow.back.admision.repository.ClaveRespuestaRepository;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class ClaveRespuestaService {

    private final
    ClaveRespuestaRepository
            claveRespuestaRepository;

    private final UsuarioAutenticadoService usuarioAutenticadoService;

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

        clave.setCreadoPor(
                usuarioAutenticadoService.obtenerActual());

        return claveRespuestaRepository
                .save(clave);
    }

    public ClaveRespuesta
    actualizar(
            Integer id,
            ClaveRespuesta data) {

        ClaveRespuesta clave =
                obtener(id);

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

        return claveRespuestaRepository
                .save(clave);
    }

    public void eliminar(
            Integer id) {

        ClaveRespuesta clave =
                obtener(id);

        claveRespuestaRepository
                .delete(clave);
    }
}
