package com.litocodigo.web.entity;

import com.litocodigo.web.enums.TResultado;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;

@Entity
@Table(name = "calificacion_detalle", uniqueConstraints = @UniqueConstraint(columnNames = {"calificacion_id", "nro_pregunta"}))
public class CalificacionDetalle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "calificacion_id", nullable = false) private Calificacion calificacion;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "clave_id", nullable = false) private ClaveRespuesta clave;
    @Column(name = "nro_pregunta", nullable = false) private Integer nroPregunta;
    @Column(name = "respuesta_alumno") private Character respuestaAlumno;
    @Column(name = "respuesta_correcta") private Character respuestaCorrecta;
    
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false) private TResultado resultado;
    @Column(name = "puntaje_aplicado", precision = 8, scale = 4, nullable = false) private BigDecimal puntajeAplicado = BigDecimal.ZERO;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Calificacion getCalificacion() { return calificacion; } public void setCalificacion(Calificacion calificacion) { this.calificacion = calificacion; }
    public ClaveRespuesta getClave() { return clave; } public void setClave(ClaveRespuesta clave) { this.clave = clave; }
    public Integer getNroPregunta() { return nroPregunta; } public void setNroPregunta(Integer nroPregunta) { this.nroPregunta = nroPregunta; }
    public Character getRespuestaAlumno() { return respuestaAlumno; } public void setRespuestaAlumno(Character respuestaAlumno) { this.respuestaAlumno = respuestaAlumno; }
    public Character getRespuestaCorrecta() { return respuestaCorrecta; } public void setRespuestaCorrecta(Character respuestaCorrecta) { this.respuestaCorrecta = respuestaCorrecta; }
    public TResultado getResultado() { return resultado; } public void setResultado(TResultado resultado) { this.resultado = resultado; }
    public BigDecimal getPuntajeApplied() { return puntajeAplicado; } public void setPuntajeApplied(BigDecimal puntajeAplicado) { this.puntajeAplicado = puntajeAplicado; }
}