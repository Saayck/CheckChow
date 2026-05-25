package checkchow.back.omr.dto;

public record OmrImportResponse(
        int total,
        int guardados,
        int actualizados,
        int omitidos) {
}
