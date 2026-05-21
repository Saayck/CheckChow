package com.litocodigo.web.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ficha_alumno")
public class FichaAlumno {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "omr_union_id", nullable = false, unique = true) private OmrUnion omrUnion;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "inscripcion_id") private Inscripcion inscripcion;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "postulante_id") private Postulante postulante;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "tema_id") private Tema tema;
    @Column(nullable = false) private Boolean habilitado = true;
    @Column(name = "motivo_inhabilitado", columnDefinition = "TEXT") private String motivoInhabilitado;
    @Column(name = "creado_en", nullable = false) private OffsetDateTime creadoEn = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public OmrUnion getOmrUnion() { return omrUnion; } public void setOmrUnion(OmrUnion omrUnion) { this.omrUnion = omrUnion; }
    public Inscripcion getInscripcion() { return inscripcion; } public void setInscripcion(Inscripcion inscripcion) { this.inscripcion = inscripcion; }
    public Postulante getPostulante() { return postulante; } public void setPostulante(Postulante postulante) { this.postulante = postulante; }
    public Tema getTema() { return tema; } public void setTema(Tema tema) { this.tema = tema; }
    public Boolean getHabilitado() { return habilitado; } public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado; }
    public String getMotivoInhabilitado() { return motivoInhabilitado; } public void setMotivoInhabilitado(String motivoInhabilitado) { this.motivoInhabilitado = motivoInhabilitado; }
    public OffsetDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }
}