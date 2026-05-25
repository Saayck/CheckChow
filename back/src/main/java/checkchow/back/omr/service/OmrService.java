package checkchow.back.omr.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.repository.ProcesoAdmisionRepository;
import checkchow.back.omr.dto.OmrIdentificacionImportDTO;
import checkchow.back.omr.dto.OmrImportResponse;
import checkchow.back.omr.dto.OmrRespuestaImportDTO;
import checkchow.back.omr.dto.OmrUnionResponse;
import checkchow.back.omr.entity.OmrDetalle;
import checkchow.back.omr.entity.OmrIdentificacion;
import checkchow.back.omr.entity.OmrRespuesta;
import checkchow.back.omr.entity.OmrUnion;
import checkchow.back.omr.repository.OmrDetalleRepository;
import checkchow.back.omr.repository.OmrIdentificacionRepository;
import checkchow.back.omr.repository.OmrRespuestaRepository;
import checkchow.back.omr.repository.OmrUnionRepository;
import checkchow.back.postulante.entity.Postulante;
import checkchow.back.postulante.repository.PostulanteRepository;
import checkchow.back.seguridad.service.UsuarioAutenticadoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OmrService {

        private final OmrIdentificacionRepository identificacionRepo;
        private final OmrRespuestaRepository respuestaRepo;
        private final OmrUnionRepository unionRepo;
        private final OmrDetalleRepository detalleRepo;
        private final PostulanteRepository postulanteRepo;
        private final ProcesoAdmisionRepository procesoRepo;
        private final UsuarioAutenticadoService usuarioAutenticadoService;

        public OmrImportResponse importarIdentificaciones(Integer procesoId, List<OmrIdentificacionImportDTO> rows) {
                ProcesoAdmision proceso = obtenerProceso(procesoId);
                int guardados = 0;
                int actualizados = 0;
                int omitidos = 0;

                for (OmrIdentificacionImportDTO row : rows) {
                        String litho = normalizarLithocode(row.lithocode());
                        if (litho.isBlank()) {
                                omitidos++;
                                continue;
                        }

                        Optional<OmrIdentificacion> existente = buscarIdentificacionPorLitho(litho);
                        OmrIdentificacion identificacion = existente.orElseGet(OmrIdentificacion::new);
                        identificacion.setProceso(proceso);
                        identificacion.setLithocode(litho);
                        identificacion.setCodPostulante(normalizarLithocode(row.codigo()));
                        identificacion.setCodigoTema(normalizarTema(row.codigoTema()));
                        identificacion.setSinCodigo(Boolean.TRUE.equals(row.sinCodigo()));
                        identificacion.setSinTema(Boolean.TRUE.equals(row.sinTema()));
                        identificacion.setLecturaDudosa(Boolean.TRUE.equals(row.lecturaDudosa()));
                        identificacion.setObservacion(row.observacion());
                        identificacion.setLeidoEn(OffsetDateTime.now());
                        identificacionRepo.save(identificacion);

                        if (existente.isPresent()) {
                                actualizados++;
                        } else {
                                guardados++;
                        }
                }

                return new OmrImportResponse(rows.size(), guardados, actualizados, omitidos);
        }

        public OmrImportResponse importarRespuestas(Integer procesoId, List<OmrRespuestaImportDTO> rows) {
                ProcesoAdmision proceso = obtenerProceso(procesoId);
                int guardados = 0;
                int actualizados = 0;
                int omitidos = 0;

                for (OmrRespuestaImportDTO row : rows) {
                        String litho = normalizarLithocode(row.lithocode());
                        if (litho.isBlank()) {
                                omitidos++;
                                continue;
                        }

                        Optional<OmrRespuesta> existente = buscarRespuestaPorLitho(litho);
                        OmrRespuesta respuesta = existente.orElseGet(OmrRespuesta::new);
                        respuesta.setProceso(proceso);
                        respuesta.setLithocode(litho);
                        respuesta.setCodigoTema(normalizarTema(row.codigoTema()));
                        respuesta.setAnulado(Boolean.TRUE.equals(row.anulado()));
                        respuesta.setLecturaDudosa(Boolean.TRUE.equals(row.lecturaDudosa()));
                        respuesta.setObservacion(row.observacion());
                        respuesta.setLeidoEn(OffsetDateTime.now());
                        OmrRespuesta saved = respuestaRepo.save(respuesta);

                        if (existente.isPresent()) {
                                detalleRepo.deleteByOmrRespuesta(saved);
                                actualizados++;
                        } else {
                                guardados++;
                        }

                        if (row.respuestas() != null) {
                                row.respuestas().forEach((nro, marca) -> {
                                        OmrDetalle detalle = new OmrDetalle();
                                        detalle.setOmrRespuesta(saved);
                                        detalle.setNroPregunta(nro);
                                        detalle.setMarca(parseMarca(marca));
                                        detalle.setMultiMarca(false);
                                        detalleRepo.save(detalle);
                                });
                        }
                }

                return new OmrImportResponse(rows.size(), guardados, actualizados, omitidos);
        }

        public OmrUnionResponse crearUnion(String lithocode) {
                String code = normalizarLithocode(lithocode);

                Optional<OmrUnion> existente = buscarUnionPorLitho(code);
                if (existente.isPresent()) {
                        return toResponse(existente.get());
                }

                DatosUnion datos = calcularUnion(code);

                OmrUnion union = new OmrUnion();
                union.setLithocode(datos.identificacion().getLithocode());
                union.setOmrIdentificacion(datos.identificacion());
                union.setOmrRespuesta(datos.respuesta());
                union.setTemasCoinciden(datos.temasCoinciden());
                union.setPostulanteEncontrado(datos.postulanteEncontrado());
                union.setUnionValida(datos.unionValida());
                union.setMotivoInvalido(datos.motivoInvalido());
                union.setProcesadoPor(usuarioAutenticadoService.obtenerActualOUsuarioSistema());

                return toResponse(unionRepo.save(union));
        }

        public OmrUnionResponse obtenerUnion(String lithocode) {
                String code = normalizarLithocode(lithocode);

                Optional<OmrUnion> existente = buscarUnionPorLitho(code);
                if (existente.isPresent()) {
                        return toResponse(existente.get());
                }

                DatosUnion datos = calcularUnion(code);
                return OmrUnionResponse.preview(
                                datos.identificacion().getLithocode(),
                                datos.identificacion(),
                                datos.respuesta(),
                                datos.postulante().orElse(null),
                                datos.temasCoinciden(),
                                datos.postulanteEncontrado(),
                                datos.unionValida(),
                                datos.motivoInvalido());
        }

        private DatosUnion calcularUnion(String lithocode) {
                OmrIdentificacion identificacion = buscarIdentificacionPorLitho(lithocode)
                                .orElseThrow(() -> new RuntimeException("Identificacion no encontrada para LITHO " + lithocode));

                OmrRespuesta respuesta = buscarRespuestaPorLitho(identificacion.getLithocode())
                                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada para LITHO " + identificacion.getLithocode()));

                Optional<Postulante> postulante = buscarPostulantePorLitho(identificacion.getLithocode());

                boolean postulanteEncontrado = postulante.isPresent();
                boolean temasCoinciden = identificacion.getCodigoTema() != null
                                && respuesta.getCodigoTema() != null
                                && identificacion.getCodigoTema().equalsIgnoreCase(respuesta.getCodigoTema());
                boolean unionValida = temasCoinciden && postulanteEncontrado && !respuesta.getAnulado();

                String motivo = null;
                if (!temasCoinciden) {
                        motivo = "Tema no coincide";
                } else if (!postulanteEncontrado) {
                        motivo = "Postulante no encontrado por LITHO";
                } else if (respuesta.getAnulado()) {
                        motivo = "Hoja anulada";
                }

                return new DatosUnion(
                                identificacion,
                                respuesta,
                                postulante,
                                temasCoinciden,
                                postulanteEncontrado,
                                unionValida,
                                motivo);
        }

        private OmrUnionResponse toResponse(OmrUnion union) {
                Postulante postulante = buscarPostulantePorLitho(union.getOmrIdentificacion().getLithocode()).orElse(null);
                return OmrUnionResponse.fromUnion(union, postulante);
        }

        private Optional<OmrUnion> buscarUnionPorLitho(String lithocode) {
                for (String variante : variantesLitho(lithocode)) {
                        Optional<OmrUnion> found = unionRepo.findByLithocode(variante);
                        if (found.isPresent()) return found;
                }
                return Optional.empty();
        }

        private Optional<OmrIdentificacion> buscarIdentificacionPorLitho(String lithocode) {
                for (String variante : variantesLitho(lithocode)) {
                        Optional<OmrIdentificacion> found = identificacionRepo.findByLithocode(variante);
                        if (found.isPresent()) return found;
                }
                return Optional.empty();
        }

        private Optional<OmrRespuesta> buscarRespuestaPorLitho(String lithocode) {
                for (String variante : variantesLitho(lithocode)) {
                        Optional<OmrRespuesta> found = respuestaRepo.findByLithocode(variante);
                        if (found.isPresent()) return found;
                }
                return Optional.empty();
        }

        private Optional<Postulante> buscarPostulantePorLitho(String lithocode) {
                for (String variante : variantesLitho(lithocode)) {
                        Optional<Postulante> found = postulanteRepo.findByCodPostulante(variante);
                        if (found.isPresent()) return found;
                }
                return Optional.empty();
        }

        private List<String> variantesLitho(String lithocode) {
                String clean = normalizarLithocode(lithocode);
                String sinCeros = clean.replaceFirst("^0+(?=\\d)", "");
                String seisDigitos = sinCeros.matches("\\d+") && sinCeros.length() < 6
                                ? "0".repeat(6 - sinCeros.length()) + sinCeros
                                : sinCeros;
                return List.of(clean, sinCeros, seisDigitos);
        }

        private String normalizarLithocode(String lithocode) {
                return lithocode == null ? "" : lithocode.trim();
        }

        private String normalizarTema(String tema) {
                return tema == null ? null : tema.trim().toUpperCase();
        }

        private Character parseMarca(String marca) {
                if (marca == null || marca.isBlank()) return null;
                return marca.trim().toUpperCase().charAt(0);
        }

        private ProcesoAdmision obtenerProceso(Integer procesoId) {
                if (procesoId != null) {
                        return procesoRepo.findById(procesoId)
                                        .orElseThrow(() -> new RuntimeException("Proceso no encontrado"));
                }
                return procesoRepo.findAll().stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Debe registrar un proceso de admision antes de importar OMR"));
        }

        private record DatosUnion(
                        OmrIdentificacion identificacion,
                        OmrRespuesta respuesta,
                        Optional<Postulante> postulante,
                        boolean temasCoinciden,
                        boolean postulanteEncontrado,
                        boolean unionValida,
                        String motivoInvalido) {
        }
}
