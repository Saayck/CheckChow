package checkchow.back.vacante.entity;

import checkchow.back.admision.entity.Carrera;
import checkchow.back.admision.entity.ProcesoAdmision;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "proceso_vacante", uniqueConstraints = @UniqueConstraint(columnNames = { "proceso_id", "carrera_id" }))
public class ProcesoVacante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    @Column(nullable = false)
    private Integer vacantes;

    @Column(name = "permite_ampliacion", nullable = false)
    private Boolean permiteAmpliacion = true;

}