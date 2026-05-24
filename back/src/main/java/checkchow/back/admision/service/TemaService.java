package checkchow.back.admision.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Tema;
import checkchow.back.admision.repository.TemaRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class TemaService {

    private final
    TemaRepository temaRepository;

    public List<Tema> listar() {

        return temaRepository
                .findAll();
    }

    public Tema obtener(
            Integer id) {

        return temaRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tema no encontrado"));
    }

    public Tema crear(
            Tema tema) {

        if (temaRepository
                .findByProcesoIdAndCodigo(
                        tema.getProceso()
                                .getId(),
                        tema.getCodigo())
                .isPresent()) {

            throw new RuntimeException(
                    "Tema ya registrado en el proceso");
        }

        return temaRepository
                .save(tema);
    }

    public Tema actualizar(
            Integer id,
            Tema data) {

        Tema tema =
                obtener(id);

        tema.setProceso(
                data.getProceso());

        tema.setCodigo(
                data.getCodigo());

        tema.setDescripcion(
                data.getDescripcion());

        tema.setTotalPreguntas(
                data.getTotalPreguntas());

        tema.setActivo(
                data.getActivo());

        return temaRepository
                .save(tema);
    }

    public void eliminar(
            Integer id) {

        Tema tema =
                obtener(id);

        temaRepository
                .delete(tema);
    }
}