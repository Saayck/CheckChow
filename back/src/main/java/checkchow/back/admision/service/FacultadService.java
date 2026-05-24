package checkchow.back.admision.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import checkchow.back.admision.entity.Facultad;
import checkchow.back.admision.repository.FacultadRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class FacultadService {

    private final
    FacultadRepository
            facultadRepository;

    public List<Facultad> listar() {

        return facultadRepository
                .findAll();
    }

    public Facultad obtener(
            Integer id) {

        return facultadRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Facultad no encontrada"));
    }

    public Facultad crear(
            Facultad facultad) {

        if (facultadRepository
                .findByCodigo(
                        facultad.getCodigo())
                .isPresent()) {

            throw new RuntimeException(
                    "Codigo ya registrado");
        }

        return facultadRepository
                .save(facultad);
    }

    public Facultad actualizar(
            Integer id,
            Facultad data) {

        Facultad facultad =
                obtener(id);

        facultad.setCodigo(
                data.getCodigo());

        facultad.setNombre(
                data.getNombre());

        facultad.setActivo(
                data.getActivo());

        return facultadRepository
                .save(facultad);
    }

    public void eliminar(
            Integer id) {

        Facultad facultad =
                obtener(id);

        facultadRepository
                .delete(facultad);
    }
}