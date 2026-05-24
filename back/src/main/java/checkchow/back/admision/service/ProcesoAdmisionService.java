package checkchow.back.admision.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcesoAdmisionService {

    private final
    ProcesoAdmisionRepository
            procesoRepository;

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

        return procesoRepository
                .save(proceso);
    }

    public ProcesoAdmision
    actualizar(
            Integer id,
            ProcesoAdmision data) {

        ProcesoAdmision proceso =
                obtener(id);

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

        proceso.setCreadoPor(
                data.getCreadoPor());

        proceso.setFechaModificacion(
                OffsetDateTime.now());

        return procesoRepository
                .save(proceso);
    }

    public void eliminar(
            Integer id) {

        ProcesoAdmision proceso =
                obtener(id);

        procesoRepository
                .delete(proceso);
    }
}
