package checkchow.back.entity;

import checkchow.back.enums.TEstadoProceso;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "proceso_admision", uniqueConstraints = @UniqueConstraint(columnNames = { "anio", "periodo" }))
public class ProcesoAdmision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 20, nullable = false)
    private String codigo;

    @Column(nullable = false)
    private Integer anio;

    @Column(length = 10, nullable = false)
    private String periodo;

    @Column(length = 255)
    private String description;

    @Column(name = "fecha_examen", nullable = false)
    private LocalDate fechaExamen;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private TEstadoProceso estado = TEstadoProceso.CONFIGURACION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "fecha_modificacion", nullable = false)
    private OffsetDateTime fechaModificacion = OffsetDateTime.now();

}