package checkchow.back.vacante.Service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.vacante.entity.ProcesoVacante;
import checkchow.back.vacante.repository.ProcesoVacanteRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcesoVacanteService {

    private final ProcesoVacanteRepository procesoVacanteRepository;

    public List<ProcesoVacante> listar() {

        return procesoVacanteRepository
                .findAll();
    }

    public ProcesoVacante obtener(
            Integer id) {

        return procesoVacanteRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Vacante no encontrada"));
    }

    public ProcesoVacante crear(
            ProcesoVacante vacante) {

        if (procesoVacanteRepository
                .findByProcesoIdAndCarreraId(
                        vacante.getProceso()
                                .getId(),
                        vacante.getCarrera()
                                .getId())
                .isPresent()) {

            throw new RuntimeException(
                    "Ya existe vacante para ese proceso y carrera");
        }

        return procesoVacanteRepository
                .save(vacante);
    }

    public ProcesoVacante actualizar(
            Integer id,
            ProcesoVacante data) {

        ProcesoVacante vacante = obtener(id);

        vacante.setProceso(
                data.getProceso());

        vacante.setCarrera(
                data.getCarrera());

        vacante.setVacantes(
                data.getVacantes());

        vacante.setPermiteAmpliacion(
                data.getPermiteAmpliacion());

        return procesoVacanteRepository
                .save(vacante);
    }

    public void eliminar(
            Integer id) {

        ProcesoVacante vacante = obtener(id);

        procesoVacanteRepository
                .delete(vacante);
    }
}