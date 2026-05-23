package checkchow.back.admision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tema", uniqueConstraints = @UniqueConstraint(columnNames = { "proceso_id", "codigo" }))
public class Tema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @Column(length = 5, nullable = false)
    private String codigo;

    @Column(length = 100)
    private String descripcion;

    @Column(name = "total_preguntas", nullable = false)
    private Integer totalPreguntas = 100;

    @Column(nullable = false)
    private Boolean activo = true;

}