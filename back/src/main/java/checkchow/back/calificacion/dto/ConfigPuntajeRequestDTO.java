package checkchow.back.calificacion.dto;

import java.math.BigDecimal;

public record ConfigPuntajeRequestDTO(
        BigDecimal puntajeCorrecto,
        BigDecimal puntajeIncorrecto,
        BigDecimal puntajeBlanco
) {}
