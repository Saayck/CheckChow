package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Inscripcion;
import checkchow.back.admision.repository.InscripcionRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class InscripcionService {

    private final
    InscripcionRepository
            inscripcionRepository;

    public List<Inscripcion>
    listar() {

        return inscripcionRepository
                .findAll();
    }

    public Inscripcion
    obtener(
            Integer id) {

        return inscripcionRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inscripción no encontrada"));
    }

    public Inscripcion
    crear(
            Inscripcion inscripcion) {

        if (inscripcionRepository
                .findByProcesoIdAndPostulanteId(
                        inscripcion.getProceso().getId(),
                        inscripcion.getPostulante().getId())
                .isPresent()) {

            throw new RuntimeException(
                    "El postulante ya está inscrito en este proceso");
        }

        inscripcion.setFechaInscripcion(
                OffsetDateTime.now());

        return inscripcionRepository
                .save(inscripcion);
    }

    public Inscripcion
    actualizar(
            Integer id,
            Inscripcion data) {

        Inscripcion inscripcion =
                obtener(id);

        inscripcion.setProceso(
                data.getProceso());

        inscripcion.setPostulante(
                data.getPostulante());

        inscripcion.setCarrera(
                data.getCarrera());

        return inscripcionRepository
                .save(inscripcion);
    }

    public void eliminar(
            Integer id) {

        Inscripcion inscripcion =
                obtener(id);

        inscripcionRepository
                .delete(inscripcion);
    }
}