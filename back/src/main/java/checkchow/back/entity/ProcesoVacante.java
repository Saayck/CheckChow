package checkchow.back.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "proceso_vacante", uniqueConstraints = @UniqueConstraint(columnNames = {"proceso_id", "carrera_id"}))
public class ProcesoVacante {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "carrera_id", nullable = false) private Carrera carrera;
    @Column(nullable = false) private Integer vacantes;
    @Column(name = "permite_ampliacion", nullable = false) private Boolean permiteAmpliacion = true;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public Carrera getCarrera() { return carrera; } public void setCarrera(Carrera carrera) { this.carrera = carrera; }
    public Integer getVacantes() { return vacantes; } public void setVacantes(Integer vacantes) { this.vacantes = vacantes; }
    public Boolean getPermiteAmpliacion() { return permiteAmpliacion; } public void setPermiteAmpliacion(Boolean permiteAmpliacion) { this.permiteAmpliacion = permiteAmpliacion; }
}