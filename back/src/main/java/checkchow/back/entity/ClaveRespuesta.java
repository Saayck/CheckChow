package checkchow.back.entity;

import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "clave_respuesta", uniqueConstraints = @UniqueConstraint(columnNames = {"tema_id", "nro_pregunta"}))
public class ClaveRespuesta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "tema_id", nullable = false) private Tema tema;
    @Column(name = "nro_pregunta", nullable = false) private Integer nroPregunta;
    @Column(name = "respuesta_correcta", nullable = false) private Character respuestaCorrecta;
    @Column(nullable = false) private Boolean formula = false; // "anulada" en el script original
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "creado_por") private Usuario creadoPor;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();
    @Column(name = "fecha_modificacion", nullable = false) private OffsetDateTime fechaModificacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Tema getTema() { return tema; } public void setTema(Tema tema) { this.tema = tema; }
    public Integer getNroPregunta() { return nroPregunta; } public void setNroPregunta(Integer nroPregunta) { this.nroPregunta = nroPregunta; }
    public Character getRespuestaCorrecta() { return respuestaCorrecta; } public void setRespuestaCorrecta(Character respuestaCorrecta) { this.respuestaCorrecta = respuestaCorrecta; }
    public Boolean getFormula() { return formula; } public void setFormula(Boolean formula) { this.formula = formula; }
    public Usuario getCreadoPor() { return creadoPor; } public void setCreadoPor(Usuario creadoPor) { this.creadoPor = creadoPor; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public OffsetDateTime getFechaModificacion() { return fechaModificacion; } public void setFechaModificacion(OffsetDateTime fechaModificacion) { this.fechaModificacion = fechaModificacion; }
}