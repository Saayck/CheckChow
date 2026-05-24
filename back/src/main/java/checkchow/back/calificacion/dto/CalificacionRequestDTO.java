package checkchow.back.calificacion.dto;

public record CalificacionRequestDTO(
        Integer correctas,
        Integer incorrectas,
        Integer enBlanco,
        Integer anuladas
) {}