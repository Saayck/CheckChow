package checkchow.back.postulante.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Carrera;
import checkchow.back.admision.repository.CarreraRepository;
import checkchow.back.postulante.dto.PostulanteImportDTO;
import checkchow.back.postulante.entity.Postulante;
import checkchow.back.postulante.repository.PostulanteRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PostulanteService {
        private final CarreraRepository carreraRepository;
        private final PostulanteRepository postulanteRepository;

        public List<Postulante> listar() {
                return postulanteRepository.findAll();
        }

        public Postulante obtener(Integer id) {

                return postulanteRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Postulante no encontrado"));
        }

        public Postulante crear(Postulante postulante) {

                if (postulanteRepository
                                .findByDni(postulante.getDni())
                                .isPresent()) {

                        throw new RuntimeException(
                                        "DNI ya registrado");
                }

                if (postulanteRepository
                                .findByCodPostulante(
                                                postulante.getCodPostulante())
                                .isPresent()) {

                        throw new RuntimeException(
                                        "Codigo postulante ya registrado");
                }

                return postulanteRepository.save(postulante);
        }

        public Postulante actualizar(
                        Integer id,
                        Postulante data) {

                Postulante postulante = obtener(id);

                postulante.setDni(data.getDni());
                postulante.setCodPostulante(
                                data.getCodPostulante());
                postulante.setNombres(
                                data.getNombres());
                postulante.setApellidoPat(
                                data.getApellidoPat());
                postulante.setApellidoMat(
                                data.getApellidoMat());
                postulante.setCarrera(
                                data.getCarrera());

                return postulanteRepository.save(postulante);
        }

        public void eliminar(Integer id) {

                Postulante postulante = obtener(id);

                postulanteRepository.delete(postulante);
        }

        @Transactional
        public List<Postulante> importar(
                        List<PostulanteImportDTO> rows) {

                List<Postulante> lista = new ArrayList<>();

                for (PostulanteImportDTO row : rows) {

                        Carrera carrera = carreraRepository
                                        .findByCodigo(
                                                        row.getCarrera())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Carrera no encontrada: "
                                                                        + row.getCarrera()));

                        Postulante p = new Postulante();

                        p.setDni(row.getDni());

                        p.setCodPostulante(
                                        UUID.randomUUID().toString());

                        p.setNombres(
                                        row.getNombres());

                        p.setApellidoPat("");
                        p.setApellidoMat("");

                        p.setCarrera(carrera);

                        lista.add(p);
                }

                return postulanteRepository
                                .saveAll(lista);
        }
}