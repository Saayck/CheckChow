package checkchow.back.entity;

import checkchow.back.enums.TEstadoProceso;
import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "proceso_admision", uniqueConstraints = @UniqueConstraint(columnNames = {"anio", "periodo"}))
public class ProcesoAdmision {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, length = 20, nullable = false) private String codigo;
    @Column(nullable = false) private Integer anio;
    @Column(length = 10, nullable = false) private String periodo;
    @Column(length = 255) private String description;
    @Column(name = "fecha_examen", nullable = false) private LocalDate fechaExamen;
    
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false) private TEstadoProceso estado = TEstadoProceso.CONFIGURACION;
    
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "creado_por") private Usuario creadoPor;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();
    @Column(name = "fecha_modificacion", nullable = false) private OffsetDateTime fechaModificacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public String getCodigo() { return codigo; } public void setCodigo(String codigo) { this.codigo = codigo; }
    public Integer getAnio() { return anio; } public void setAnio(Integer anio) { this.anio = anio; }
    public String getPeriodo() { return periodo; } public void setPeriodo(String periodo) { this.periodo = periodo; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public LocalDate getFechaExamen() { return fechaExamen; } public void setFechaExamen(LocalDate fechaExamen) { this.fechaExamen = fechaExamen; }
    public TEstadoProceso getEstado() { return estado; } public void setEstado(TEstadoProceso estado) { this.estado = estado; }
    public Usuario getCreadoPor() { return creadoPor; } public void setCreadoPor(Usuario creadoPor) { this.creadoPor = creadoPor; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public OffsetDateTime getFechaModificacion() { return fechaModificacion; } public void setFechaModificacion(OffsetDateTime fechaModificacion) { this.fechaModificacion = fechaModificacion; }
}