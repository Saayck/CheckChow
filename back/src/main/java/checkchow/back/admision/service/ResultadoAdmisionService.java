package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ResultadoAdmision;
import checkchow.back.admision.repository.ResultadoAdmisionRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultadoAdmisionService {

    private final
    ResultadoAdmisionRepository
            resultadoRepository;

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

        if (Boolean.TRUE.equals(
                resultado.getPublicado())) {

            resultado.setFechaPublicacion(
                    OffsetDateTime.now());
        }

        return resultadoRepository
                .save(resultado);
    }

    public ResultadoAdmision
    actualizar(
            Integer id,
            ResultadoAdmision data) {

        ResultadoAdmision resultado =
                obtener(id);

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

        resultado.setGeneradoPor(
                data.getGeneradoPor());

        return resultadoRepository
                .save(resultado);
    }

    public void eliminar(
            Integer id) {

        ResultadoAdmision resultado =
                obtener(id);

        resultadoRepository
                .delete(resultado);
    }
}