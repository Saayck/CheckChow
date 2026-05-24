package checkchow.back.admision.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Carrera;
import checkchow.back.admision.repository.CarreraRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class CarreraService {

    private final
    CarreraRepository carreraRepository;

    public List<Carrera> listar() {

        return carreraRepository
                .findAll();
    }

    public Carrera obtener(
            Integer id) {

        return carreraRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Carrera no encontrada"));
    }

    public Carrera crear(
            Carrera carrera) {

        if (carreraRepository
                .findByCodigo(
                        carrera.getCodigo())
                .isPresent()) {

            throw new RuntimeException(
                    "Codigo de carrera ya registrado");
        }

        return carreraRepository
                .save(carrera);
    }

    public Carrera actualizar(
            Integer id,
            Carrera data) {

        Carrera carrera =
                obtener(id);

        carrera.setFacultad(
                data.getFacultad());

        carrera.setCodigo(
                data.getCodigo());

        carrera.setNombre(
                data.getNombre());

        carrera.setActivo(
                data.getActivo());

        return carreraRepository
                .save(carrera);
    }

    public void eliminar(
            Integer id) {

        Carrera carrera =
                obtener(id);

        carreraRepository
                .delete(carrera);
    }
}