package checkchow.back.omr.dto;

public record OmrIdentificacionImportDTO(
        String lithocode,
        String codigoTema,
        String codigo,
        Boolean sinCodigo,
        Boolean sinTema,
        Boolean lecturaDudosa,
        String observacion) {
}
