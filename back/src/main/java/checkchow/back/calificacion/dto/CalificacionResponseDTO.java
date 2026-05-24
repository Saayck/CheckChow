package checkchow.back.calificacion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalificacionResponseDTO {
    private Integer id;
    private Integer fichaId;
    private Integer procesoId;
    private Integer correctas;
    private Integer incorrectas;
    private Integer enBlanco;
    private Integer anuladas;
    private BigDecimal puntajeBruto;
    private BigDecimal puntajeFinal;
    private String nombreCalificador;
    private LocalDateTime calificadoEn;
    private LocalDateTime recalculadoEn;
}