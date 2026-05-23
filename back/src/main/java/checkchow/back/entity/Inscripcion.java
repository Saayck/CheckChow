package checkchow.back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inscripcion", uniqueConstraints = @UniqueConstraint(columnNames = {"proceso_id", "postulante_id"}))
public class Inscripcion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "postulante_id", nullable = false) private Postulante postulante;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "carrera_id", nullable = false) private Carrera carrera;
    @Column(name = "fecha_inscripcion", nullable = false) private OffsetDateTime fechaInscripcion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public Postulante getPostulante() { return postulante; } public void setPostulante(Postulante postulante) { this.postulante = postulante; }
    public Carrera getCarrera() { return carrera; } public void setCarrera(Carrera carrera) { this.carrera = carrera; }
    public OffsetDateTime getFechaInscripcion() { return fechaInscripcion; } public void setFechaInscripcion(OffsetDateTime fechaInscripcion) { this.fechaInscripcion = fechaInscripcion; }
}