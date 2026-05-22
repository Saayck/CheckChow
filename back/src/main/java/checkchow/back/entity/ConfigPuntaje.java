package checkchow.back.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "config_puntaje")
public class ConfigPuntaje {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false, unique = true) private ProcesoAdmision proceso;
    @Column(name = "puntaje_correcto", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeCorrecto = new BigDecimal("20.0000");
    @Column(name = "puntaje_incorrecto", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeIncorrecto = new BigDecimal("-1.8750");
    @Column(name = "puntaje_blanco", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeBlanco = BigDecimal.ZERO;
    @Column(name = "puntaje_anulado", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeAnulado = BigDecimal.ZERO;
    @Column(name = "puntaje_base", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeBase = BigDecimal.ZERO;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "modificado_por") private Usuario modificadoPor;
    @Column(name = "fecha_modificacion", nullable = false) private OffsetDateTime fechaModificacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public BigDecimal getPuntajeCorrecto() { return puntajeCorrecto; } public void setPuntajeCorrecto(BigDecimal puntajeCorrecto) { this.puntajeCorrecto = puntajeCorrecto; }
    public BigDecimal getPuntajeIncorrecto() { return puntajeIncorrecto; } public void setPuntajeIncorrecto(BigDecimal puntajeIncorrecto) { this.puntajeIncorrecto = puntajeIncorrecto; }
    public BigDecimal getPuntajeBlanco() { return puntajeBlanco; } public void setPuntajeBlanco(BigDecimal puntajeBlanco) { this.puntajeBlanco = puntajeBlanco; }
    public BigDecimal getPuntajeAnulado() { return puntajeAnulado; } public void setPuntajeAnulado(BigDecimal puntajeAnulado) { this.puntajeAnulado = puntajeAnulado; }
    public BigDecimal getPuntajeBase() { return puntajeBase; } public void setPuntajeBase(BigDecimal puntajeBase) { this.puntajeBase = puntajeBase; }
    public Usuario getModificadoPor() { return modificadoPor; } public void setModificadoPor(Usuario modificadoPor) { this.modificadoPor = modificadoPor; }
    public OffsetDateTime getFechaModificacion() { return fechaModificacion; } public void setFechaModificacion(OffsetDateTime fechaModificacion) { this.fechaModificacion = fechaModificacion; }
}