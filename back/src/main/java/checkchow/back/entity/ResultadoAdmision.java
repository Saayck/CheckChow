package checkchow.back.entity;

import checkchow.back.enums.TCondicion;
import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "resultado_admision")
public class ResultadoAdmision {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "inscripcion_id", nullable = false, unique = true) private Inscripcion inscripcion;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "calificacion_id", nullable = false, unique = true) private Calificacion calificacion;
    @Column(name = "puntaje_final", precision = 10, scale = 4, nullable = false) private BigDecimal puntajeFinal;
    @Column(name = "orden_merito") private Integer ordenMerito;
    
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false) private TCondicion condicion = TCondicion.NO_INGRESO;
    
    @Column(name = "vacante_ampliada", nullable = false) private Boolean vacanteAmpliada = false;
    @Column(nullable = false) private Boolean publicado = false;
    @Column(name = "fecha_publicacion") private OffsetDateTime fechaPublicacion;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "generado_por") private Usuario generadoPor;
    @Column(name = "generado_en", nullable = false) private OffsetDateTime generadoEn = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public Inscripcion getInscripcion() { return inscripcion; } public void setInscripcion(Inscripcion inscripcion) { this.inscripcion = inscripcion; }
    public Calificacion getCalificacion() { return calificacion; } public void setCalificacion(Calificacion calificacion) { this.calificacion = calificacion; }
    public BigDecimal getPuntajeFinal() { return puntajeFinal; } public void setPuntajeFinal(BigDecimal puntajeFinal) { this.puntajeFinal = puntajeFinal; }
    public Integer getOrdenMerito() { return ordenMerito; } public void setOrdenMerito(Integer ordenMerito) { this.ordenMerito = ordenMerito; }
    public TCondicion getCondicion() { return condicion; } public void setCondicion(TCondicion condicion) { this.condicion = condicion; }
    public Boolean getVacanteAmpliada() { return vacanteAmpliada; } public void setVacanteAmpliada(Boolean vacanteAmpliada) { this.vacanteAmpliada = vacanteAmpliada; }
    public Boolean getPublicado() { return publicado; } public void setPublicado(Boolean publicado) { this.publicado = publicado; }
    public OffsetDateTime getFechaPublicacion() { return fechaPublicacion; } public void setFechaPublicacion(OffsetDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public Usuario getGeneradoPor() { return generadoPor; } public void setGeneradoPor(Usuario generadoPor) { this.generadoPor = generadoPor; }
    public OffsetDateTime getGeneradoEn() { return generadoEn; } public void setGeneradoEn(OffsetDateTime generadoEn) { this.generadoEn = generadoEn; }
}