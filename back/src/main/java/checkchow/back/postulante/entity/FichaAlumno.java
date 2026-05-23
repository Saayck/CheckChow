package checkchow.back.postulante.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

import checkchow.back.admision.entity.Inscripcion;
import checkchow.back.admision.entity.ProcesoAdmision;
import checkchow.back.admision.entity.Tema;
import checkchow.back.omr.entity.OmrUnion;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "ficha_alumno")
public class FichaAlumno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id", nullable = false)
    private ProcesoAdmision proceso;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omr_union_id", nullable = false, unique = true)
    private OmrUnion omrUnion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inscripcion_id")
    private Inscripcion inscripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postulante_id")
    private Postulante postulante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tema_id")
    private Tema tema;

    @Column(nullable = false)
    private Boolean habilitado = true;

    @Column(name = "motivo_inhabilitado", columnDefinition = "TEXT")
    private String motivoInhabilitado;
    
    @Column(name = "creado_en", nullable = false)
    private OffsetDateTime creadoEn = OffsetDateTime.now();

}