package checkchow.back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "postulante")
public class Postulante {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, length = 15, nullable = false) private String dni;
    @Column(name = "cod_postulante", unique = true, length = 20, nullable = false) private String codPostulante;
    @Column(length = 100, nullable = false) private String nombres;
    @Column(name = "apellido_pat", length = 80, nullable = false) private String apellidoPat;
    @Column(name = "apellido_mat", length = 80) private String apellidoMat;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "carrera_id", nullable = false) private Carrera carrera;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public String getDni() { return dni; } public void setDni(String dni) { this.dni = dni; }
    public String getCodPostulante() { return codPostulante; } public void setCodPostulante(String codPostulante) { this.codPostulante = codPostulante; }
    public String getNombres() { return nombres; } public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidoPat() { return apellidoPat; } public void setApellidoPat(String apellidoPat) { this.apellidoPat = apellidoPat; }
    public String getApellidoMat() { return apellidoMat; } public void setApellidoMat(String apellidoMat) { this.apellidoMat = apellidoMat; }
    public Carrera getCarrera() { return carrera; } public void setCarrera(Carrera carrera) { this.carrera = carrera; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}