package checkchow.back.omr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "omr_detalle", uniqueConstraints = @UniqueConstraint(columnNames = { "omr_respuesta_id",
        "nro_pregunta" }))
public class OmrDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omr_respuesta_id", nullable = false)
    private OmrRespuesta omrRespuesta;

    @Column(name = "nro_pregunta", nullable = false)
    private Integer nroPregunta;

    @Column
    private Character marca;

    @Column(name = "multi_marca", nullable = false)
    private Boolean multiMarca = false;

}