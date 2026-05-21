package com.litocodigo.web.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "omr_union")
public class OmrUnion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, length = 60, nullable = false) private String lithocode;
    
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "omr_identificacion_id", nullable = false, unique = true) private OmrIdentificacion omrIdentificacion;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "omr_respuesta_id", nullable = false, unique = true) private OmrRespuesta omrRespuesta;
    
    @Column(name = "temas_coinciden") private Boolean temasCoinciden;
    @Column(name = "postulante_encontrado") private Boolean postulanteEncontrado;
    @Column(name = "union_valida", nullable = false) private Boolean unionValida = false;
    @Column(name = "motivo_invalido", columnDefinition = "TEXT") private String motivoInvalido;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "procesado_por") private Usuario procesadoPor;
    @Column(name = "procesado_en", nullable = false) private OffsetDateTime procesadoEn = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public String getLithocode() { return lithocode; } public void setLithocode(String lithocode) { this.lithocode = lithocode; }
    public OmrIdentificacion getOmrIdentificacion() { return omrIdentificacion; } public void setOmrIdentificacion(OmrIdentificacion omrIdentificacion) { this.omrIdentificacion = omrIdentificacion; }
    public OmrRespuesta getOmrRespuesta() { return omrRespuesta; } public void setOmrRespuesta(OmrRespuesta omrRespuesta) { this.omrRespuesta = omrRespuesta; }
    public Boolean getTemasCoinciden() { return temasCoinciden; } public void setTemasCoinciden(Boolean temasCoinciden) { this.temasCoinciden = temasCoinciden; }
    public Boolean getPostulanteEncontrado() { return postulanteEncontrado; } public void setPostulanteEncontrado(Boolean postulanteEncontrado) { this.postulanteEncontrado = postulanteEncontrado; }
    public Boolean getUnionValida() { return unionValida; } public void setUnionValida(Boolean unionValida) { this.unionValida = unionValida; }
    public String getMotivoInvalido() { return motivoInvalido; } public void setMotivoInvalido(String motivoInvalido) { this.motivoInvalido = motivoInvalido; }
    public Usuario getProcesadoPor() { return procesadoPor; } public void setProcesadoPor(Usuario procesadoPor) { this.procesadoPor = procesadoPor; }
    public OffsetDateTime getProcesadoEn() { return procesadoEn; } public void setProcesadoEn(OffsetDateTime procesadoEn) { this.procesadoEn = procesadoEn; }
}