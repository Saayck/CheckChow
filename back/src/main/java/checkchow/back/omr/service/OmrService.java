package checkchow.back.omr.service;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import checkchow.back.entity.Postulante;
import checkchow.back.omr.entity.*;
import checkchow.back.omr.repository.*;
import checkchow.back.repositories.PostulanteRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class OmrService {

    private final OmrIdentificacionRepository identificacionRepo;
    private final OmrRespuestaRepository respuestaRepo;
    private final OmrUnionRepository unionRepo;
    private final PostulanteRepository postulanteRepo;

    public OmrUnion crearUnion(String lithocode) {

        OmrIdentificacion identificacion =
                identificacionRepo.findByLithocode(lithocode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Identificación no encontrada"));

        OmrRespuesta respuesta =
                respuestaRepo.findByLithocode(lithocode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Respuesta no encontrada"));

        Optional<Postulante> postulante =
                postulanteRepo.findByCodPostulante(
                        identificacion.getCodPostulante());

        boolean postulanteEncontrado = postulante.isPresent();

        boolean temasCoinciden =
                identificacion.getCodigoTema() != null
                && respuesta.getCodigoTema() != null
                && identificacion.getCodigoTema()
                        .equalsIgnoreCase(
                                respuesta.getCodigoTema());

        boolean unionValida =
                temasCoinciden
                && postulanteEncontrado
                && !respuesta.getAnulado();

        String motivo = null;

        if (!temasCoinciden) {
            motivo = "Tema no coincide";
        } else if (!postulanteEncontrado) {
            motivo = "Postulante no encontrado";
        } else if (respuesta.getAnulado()) {
            motivo = "Hoja anulada";
        }

        OmrUnion union = new OmrUnion();

        union.setLithocode(lithocode);
        union.setOmrIdentificacion(identificacion);
        union.setOmrRespuesta(respuesta);
        union.setTemasCoinciden(temasCoinciden);
        union.setPostulanteEncontrado(postulanteEncontrado);
        union.setUnionValida(unionValida);
        union.setMotivoInvalido(motivo);

        return unionRepo.save(union);
    }

    public OmrUnion obtenerUnion(String lithocode) {

        return unionRepo.findByLithocode(lithocode)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Union no encontrada"));
    }

}