package checkchow.back.entity;

import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "calificacion")
public class Calificacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ficha_id", nullable = false, unique = true) private FichaAlumno ficha;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @Column(nullable = false) private Integer correctas = 0;
    @Column(nullable = false) private Integer incorrectas = 0;
    @Column(name = "en_blanco", nullable = false) private Integer enBlanco = 0;
    @Column(nullable = false) private Integer anuladas = 0;
    @Column(name = "puntaje_bruto", precision = 10, scale = 4, nullable = false) private BigDecimal puntajeBruto = BigDecimal.ZERO;
    @Column(name = "puntaje_final", precision = 10, scale = 4, nullable = false) private BigDecimal puntajeFinal = BigDecimal.ZERO;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "calificado_por") private Usuario calificadoPor;
    @Column(name = "calificado_en", nullable = false) private OffsetDateTime calificadoEn = OffsetDateTime.now();
    @Column(name = "recalculado_en") private OffsetDateTime recalculadoEn;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public FichaAlumno getFicha() { return ficha; } public void setFicha(FichaAlumno ficha) { this.ficha = ficha; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public Integer getCorrectas() { return correctas; } public void setCorrectas(Integer correctas) { this.correctas = correctas; }
    public Integer getIncorrectas() { return incorrectas; } public void setIncorrectas(Integer incorrectas) { this.incorrectas = incorrectas; }
    public Integer getEnBlanco() { return enBlanco; } public void setEnBlanco(Integer enBlanco) { this.enBlanco = enBlanco; }
    public Integer getAnuladas() { return anuladas; } public void setAnuladas(Integer anuladas) { this.anuladas = anuladas; }
    public BigDecimal getPuntajeBruto() { return puntajeBruto; } public void setPuntajeBruto(BigDecimal puntajeBruto) { this.puntajeBruto = puntajeBruto; }
    public BigDecimal getPuntajeFinal() { return puntajeFinal; } public void setPuntajeFinal(BigDecimal puntajeFinal) { this.puntajeFinal = puntajeFinal; }
    public Usuario getCalificadoPor() { return calificadoPor; } public void setCalificadoPor(Usuario calificadoPor) { this.calificadoPor = calificadoPor; }
    public OffsetDateTime getCalificadoEn() { return calificadoEn; } public void setCalificadoEn(OffsetDateTime calificadoEn) { this.calificadoEn = calificadoEn; }
    public OffsetDateTime getRecalculadoEn() { return recalculadoEn; } public void setRecalculadoEn(OffsetDateTime recalculadoEn) { this.recalculadoEn = recalculadoEn; }
}