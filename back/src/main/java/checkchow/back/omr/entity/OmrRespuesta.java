package checkchow.back.omr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

import checkchow.back.entity.ProcesoAdmision;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "omr_respuesta")
public class OmrRespuesta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @Column(unique = true, length = 60, nullable = false)
    private String lithocode;

    @Column(name = "codigo_tema", length = 5)
    private String codigoTema;

    @Column(nullable = false)
    private Boolean anulado = false;

    @Column(name = "lectura_dudosa", nullable = false)
    private Boolean lecturaDudosa = false;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "leido_en", nullable = false)
    private OffsetDateTime leidoEn = OffsetDateTime.now();

   
}