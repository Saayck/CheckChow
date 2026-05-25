package checkchow.back.omr.dto;

import java.time.OffsetDateTime;

import checkchow.back.omr.entity.OmrIdentificacion;
import checkchow.back.omr.entity.OmrRespuesta;
import checkchow.back.omr.entity.OmrUnion;
import checkchow.back.postulante.entity.Postulante;

public record OmrUnionResponse(
        Integer id,
        String lithocode,
        Boolean persistida,
        Boolean temasCoinciden,
        Boolean postulanteEncontrado,
        Boolean unionValida,
        String motivoInvalido,
        Integer identificacionId,
        Integer respuestaId,
        String codPostulante,
        String codigoTemaIdentificacion,
        String codigoTemaRespuesta,
        Boolean respuestaAnulada,
        Boolean lecturaDudosaIdentificacion,
        Boolean lecturaDudosaRespuesta,
        Integer postulanteId,
        String postulanteNombre,
        String procesadoPor,
        OffsetDateTime procesadoEn) {

    public static OmrUnionResponse fromUnion(OmrUnion union, Postulante postulante) {
        OmrIdentificacion identificacion = union.getOmrIdentificacion();
        OmrRespuesta respuesta = union.getOmrRespuesta();

        return new OmrUnionResponse(
                union.getId(),
                union.getLithocode(),
                true,
                union.getTemasCoinciden(),
                union.getPostulanteEncontrado(),
                union.getUnionValida(),
                union.getMotivoInvalido(),
                identificacion.getId(),
                respuesta.getId(),
                identificacion.getCodPostulante(),
                identificacion.getCodigoTema(),
                respuesta.getCodigoTema(),
                respuesta.getAnulado(),
                identificacion.getLecturaDudosa(),
                respuesta.getLecturaDudosa(),
                postulante != null ? postulante.getId() : null,
                postulante != null ? nombreCompleto(postulante) : null,
                union.getProcesadoPor() != null ? union.getProcesadoPor().getNombre_completo() : null,
                union.getProcesadoEn());
    }

    public static OmrUnionResponse preview(
            String lithocode,
            OmrIdentificacion identificacion,
            OmrRespuesta respuesta,
            Postulante postulante,
            Boolean temasCoinciden,
            Boolean postulanteEncontrado,
            Boolean unionValida,
            String motivoInvalido) {
        return new OmrUnionResponse(
                null,
                lithocode,
                false,
                temasCoinciden,
                postulanteEncontrado,
                unionValida,
                motivoInvalido,
                identificacion.getId(),
                respuesta.getId(),
                identificacion.getCodPostulante(),
                identificacion.getCodigoTema(),
                respuesta.getCodigoTema(),
                respuesta.getAnulado(),
                identificacion.getLecturaDudosa(),
                respuesta.getLecturaDudosa(),
                postulante != null ? postulante.getId() : null,
                postulante != null ? nombreCompleto(postulante) : null,
                null,
                null);
    }

    private static String nombreCompleto(Postulante postulante) {
        return String.join(" ",
                postulante.getNombres(),
                postulante.getApellidoPat(),
                postulante.getApellidoMat() != null ? postulante.getApellidoMat() : "").trim();
    }
}
