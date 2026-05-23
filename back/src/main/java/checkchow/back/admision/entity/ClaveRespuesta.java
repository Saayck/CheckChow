package checkchow.back.admision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

import checkchow.back.usuarios.entity.Usuario;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "clave_respuesta", uniqueConstraints = @UniqueConstraint(columnNames = { "tema_id", "nro_pregunta" }))
public class ClaveRespuesta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tema_id", nullable = false)
    private Tema tema;

    @Column(name = "nro_pregunta", nullable = false)
    private Integer nroPregunta;

    @Column(name = "respuesta_correcta", nullable = false)
    private Character respuestaCorrecta;

    @Column(nullable = false)
    private Boolean formula = false; // "anulada" en el script original

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "fecha_modificacion", nullable = false)
    private OffsetDateTime fechaModificacion = OffsetDateTime.now();

}