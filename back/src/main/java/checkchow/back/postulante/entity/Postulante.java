package checkchow.back.postulante.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

import checkchow.back.admision.entity.Carrera;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "postulante")
public class Postulante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 15, nullable = false)
    private String dni;

    @Column(name = "cod_postulante", unique = true, length = 20, nullable = false)
    private String codPostulante;

    @Column(length = 100, nullable = false)
    private String nombres;

    @Column(name = "apellido_pat", length = 80, nullable = false)
    private String apellidoPat;

    @Column(name = "apellido_mat", length = 80)
    private String apellidoMat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id", nullable = false)
    private Carrera carrera;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    
}