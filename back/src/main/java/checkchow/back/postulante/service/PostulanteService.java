package checkchow.back.postulante.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.admision.entity.Carrera;
import checkchow.back.admision.repository.CarreraRepository;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.postulante.dto.PostulanteImportDTO;
import checkchow.back.postulante.entity.Postulante;
import checkchow.back.postulante.repository.PostulanteRepository;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class PostulanteService {
        private final CarreraRepository carreraRepository;
        private final PostulanteRepository postulanteRepository;
        private final AuditoriaService auditoriaService;
        private final UsuarioAutenticadoService usuarioAutenticadoService;

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

                Postulante guardado = postulanteRepository.save(postulante);
                auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                                TAccion.CREATE, TMetodoHttp.POST, "/api/postulante", "postulante",
                                String.valueOf(guardado.getId()), snapshot(guardado), null);
                return guardado;
        }

        public Postulante actualizar(
                        Integer id,
                        Postulante data) {

                Postulante postulante = obtener(id);
                String valorAnterior = snapshot(postulante);

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

                Postulante guardado = postulanteRepository.save(postulante);
                auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                                TAccion.UPDATE, TMetodoHttp.PUT, "/api/postulante/" + id, "postulante",
                                String.valueOf(id), valorAnterior, snapshot(guardado), null);
                return guardado;
        }

        public void eliminar(Integer id) {

                Postulante postulante = obtener(id);

                String valorAnterior = snapshot(postulante);

                postulanteRepository.delete(postulante);
                auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                                TAccion.DELETE, TMetodoHttp.DELETE, "/api/postulante/" + id, "postulante",
                                String.valueOf(id), valorAnterior,
                                auditoriaService.toJson(Map.of("accion", "POSTULANTE_ELIMINADO", "id", id)), null);
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

                List<Postulante> guardados = postulanteRepository.saveAll(lista);
                auditoriaService.registrarEvento(usuarioAutenticadoService.obtenerActualOUsuarioSistema(), null,
                                TAccion.IMPORTACION, TMetodoHttp.POST, "/api/postulante/import", "postulante",
                                null, auditoriaService.toJson(Map.of(
                                                "accion", "IMPORTACION_POSTULANTES_DBF",
                                                "filasRecibidas", rows.size(),
                                                "registrosGuardadosOActualizados", guardados.size())), null);
                return guardados;
        }

        private String snapshot(Postulante postulante) {
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("id", postulante.getId());
                data.put("dni", postulante.getDni());
                data.put("codPostulante", postulante.getCodPostulante());
                data.put("nombres", postulante.getNombres());
                data.put("apellidoPat", postulante.getApellidoPat());
                data.put("apellidoMat", postulante.getApellidoMat());
                data.put("carreraId", postulante.getCarrera() != null ? postulante.getCarrera().getId() : null);
                return auditoriaService.toJson(data);
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
