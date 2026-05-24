package checkchow.back.calificacion.entity;

import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.postulante.entity.FichaAlumno;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "calificacion")
public class Calificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_id", nullable = false, unique = true)
    private FichaAlumno ficha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @Column(nullable = false)
    private Integer correctas = 0;

    @Column(nullable = false)
    private Integer incorrectas = 0;

    @Column(name = "en_blanco", nullable = false)
    private Integer enBlanco = 0;

    @Column(nullable = false)
    private Integer anuladas = 0;

    @Column(name = "puntaje_bruto", precision = 10, scale = 4, nullable = false)
    private BigDecimal puntajeBruto = BigDecimal.ZERO;

    @Column(name = "puntaje_final", precision = 10, scale = 4, nullable = false)
    private BigDecimal puntajeFinal = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calificado_por")
    private Usuario calificadoPor;

    @Column(name = "calificado_en", nullable = false)
    private LocalDateTime calificadoEn = LocalDateTime.now();

    @Column(name = "recalculado_en")
    private LocalDateTime recalculadoEn;

}