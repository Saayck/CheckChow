package checkchow.back.entity;

import checkchow.back.enums.TResultado;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "calificacion_detalle", uniqueConstraints = @UniqueConstraint(columnNames = { "calificacion_id",
        "nro_pregunta" }))

public class CalificacionDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calificacion_id", nullable = false)
    private Calificacion calificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clave_id", nullable = false)
    private ClaveRespuesta clave;

    @Column(name = "nro_pregunta", nullable = false)
    private Integer nroPregunta;

    @Column(name = "respuesta_alumno")
    private Character respuestaAlumno;

    @Column(name = "respuesta_correcta")
    private Character respuestaCorrecta;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private TResultado resultado;

    @Column(name = "puntaje_aplicado", precision = 8, scale = 4, nullable = false)
    private BigDecimal puntajeAplicado = BigDecimal.ZERO;

}