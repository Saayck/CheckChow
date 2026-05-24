package checkchow.back.admision.entity;

import checkchow.back.calificacion.entity.Calificacion;
import checkchow.back.enums.TCondicion;
import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "resultado_admision")
public class ResultadoAdmision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inscripcion_id", nullable = false, unique = true)
    private Inscripcion inscripcion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calificacion_id", nullable = false, unique = true)
    private Calificacion calificacion;

    @Column(name = "puntaje_final", precision = 10, scale = 4, nullable = false)
    private BigDecimal puntajeFinal;

    @Column(name = "orden_merito")
    private Integer ordenMerito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TCondicion condicion = TCondicion.NO_INGRESO;

    @Column(name = "vacante_ampliada", nullable = false)
    private Boolean vacanteAmpliada = false;

    @Column(nullable = false)
    private Boolean publicado = false;

    @Column(name = "fecha_publicacion")
    private OffsetDateTime fechaPublicacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generado_por")
    private Usuario generadoPor;

    @Column(name = "generado_en", nullable = false)
    private OffsetDateTime generadoEn = OffsetDateTime.now();

}