package com.litocodigo.web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tema", uniqueConstraints = @UniqueConstraint(columnNames = {"proceso_id", "codigo"}))
public class Tema {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proceso_id", nullable = false) private ProcesoAdmision proceso;
    @Column(length = 5, nullable = false) private String codigo;
    @Column(length = 100) private String descripcion;
    @Column(name = "total_preguntas", nullable = false) private Integer totalPreguntas = 100;
    @Column(nullable = false) private Boolean activo = true;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public ProcesoAdmision getProceso() { return proceso; } public void setProceso(ProcesoAdmision proceso) { this.proceso = proceso; }
    public String getCodigo() { return codigo; } public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getTotalPreguntas() { return totalPreguntas; } public void setTotalPreguntas(Integer totalPreguntas) { this.totalPreguntas = totalPreguntas; }
    public Boolean getActivo() { return activo; } public void setActivo(Boolean activo) { this.activo = activo; }
}