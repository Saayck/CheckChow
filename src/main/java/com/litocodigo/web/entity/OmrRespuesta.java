package com.litocodigo.web.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "omr_respuesta")
public class OmrRespuesta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @Column(unique = true, length = 60, nullable = false) private String lithocode;
    @Column(name = "codigo_tema", length = 5) private String codigoTema;
    @Column(nullable = false) private Boolean	anulado = false;
    @Column(name = "lectura_dudosa", nullable = false) private Boolean lecturaDudosa = false;
    @Column(columnDefinition = "TEXT") private String observacion;
    @Column(name = "leido_en", nullable = false) private OffsetDateTime leidoEn = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public String getLithocode() { return lithocode; } public void setLithocode(String lithocode) { this.lithocode = lithocode; }
    public String getCodigoTema() { return codigoTema; } public void setCodigoTema(String codigoTema) { this.codigoTema = codigoTema; }
    public Boolean getAnulado() { return	anulado; } public void setAnulado(Boolean	anulado) { this.anulado =	anulado; }
    public Boolean getLecturaDudosa() { return lecturaDudosa; } public void setLecturaDudosa(Boolean lecturaDudosa) { this.lecturaDudosa = lecturaDudosa; }
    public String getObservacion() { return observacion; } public void setObservacion(String observacion) { this.observacion = observacion; }
    public OffsetDateTime getLeidoEn() { return leidoEn; } public void setLeidoEn(OffsetDateTime leidoEn) { this.leidoEn = leidoEn; }
}