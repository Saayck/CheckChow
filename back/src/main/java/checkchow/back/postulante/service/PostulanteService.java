package checkchow.back.postulante.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

                        if (row.getDni() == null || row.getDni().isBlank()) continue;

                        // Omitir duplicados por DNI
                        // Buscar carrera por codigo (exacto) → codigo (ignoreCase) → nombre (ignoreCase)
                        String carreraKey = row.getCarrera() != null ? row.getCarrera().trim() : "";
                        Carrera carrera = null;
                        if (!carreraKey.isEmpty()) {
                                carrera = carreraRepository.findByCodigo(carreraKey)
                                        .or(() -> carreraRepository.findByCodigoIgnoreCase(carreraKey))
                                        .or(() -> carreraRepository.findByNombreIgnoreCase(carreraKey))
                                        .orElse(null);
                        }
                        // Si no se encuentra la carrera se guarda el postulante sin carrera (nullable)

                        Optional<Postulante> existenteOpt = postulanteRepository.findByDni(row.getDni());
                        if (existenteOpt.isPresent()) {
                                Postulante existente = existenteOpt.get();
                                if (existente.getCarrera() == null && carrera != null) {
                                        existente.setCarrera(carrera);
                                        lista.add(existente);
                                }
                                continue;
                        }

                        Postulante p = new Postulante();

                        p.setDni(row.getDni());
                        p.setCodPostulante(buildCodPostulante(row.getLitho()));
                        p.setNombres(row.getNombres() != null ? row.getNombres() : "");
                        p.setApellidoPat(row.getApellidoPat() != null ? row.getApellidoPat() : "");
                        p.setApellidoMat(row.getApellidoMat() != null ? row.getApellidoMat() : "");
                        p.setCarrera(carrera);

                        lista.add(p);
                }

                return postulanteRepository.saveAll(lista);
        }

        private String buildCodPostulante(String litho) {
                String cleanLitho = litho != null ? litho.trim() : "";
                if (!cleanLitho.isEmpty()) {
                        String code = cleanLitho.length() > 20 ? cleanLitho.substring(0, 20) : cleanLitho;
                        if (postulanteRepository.findByCodPostulante(code).isEmpty()) {
                                return code;
                        }
                }

                String generated;
                do {
                        generated = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
                } while (postulanteRepository.findByCodPostulante(generated).isPresent());

                return generated;
        }
}
