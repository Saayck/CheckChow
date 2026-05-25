package checkchow.back.omr.dto;

import java.util.Map;

public record OmrRespuestaImportDTO(
        String lithocode,
        String codigoTema,
        Boolean anulado,
        Boolean lecturaDudosa,
        String observacion,
        Map<Integer, String> respuestas) {
}
