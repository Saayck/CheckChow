package checkchow.back.omr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import checkchow.back.entity.Usuario;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "omr_union")
public class OmrUnion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 60, nullable = false)
    private String lithocode;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omr_identificacion_id", nullable = false, unique = true)
    private OmrIdentificacion omrIdentificacion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omr_respuesta_id", nullable = false, unique = true)
    private OmrRespuesta omrRespuesta;

    @Column(name = "temas_coinciden")
    private Boolean temasCoinciden;

    @Column(name = "postulante_encontrado")
    private Boolean postulanteEncontrado;

    @Column(name = "union_valida", nullable = false)
    private Boolean unionValida = false;

    @Column(name = "motivo_invalido", columnDefinition = "TEXT")
    private String motivoInvalido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procesado_por")
    private Usuario procesadoPor;

    @Column(name = "procesado_en", nullable = false)
    private OffsetDateTime procesadoEn = OffsetDateTime.now();

}