package com.litocodigo.web.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "facultad")
public class Facultad {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, length = 10, nullable = false) private String codigo;
    @Column(length = 150, nullable = false) private String nombre;
    @Column(nullable = false) private Boolean activo = true;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public String getCodigo() { return codigo; } public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; } public void setNombre(String nombre) { this.nombre = nombre; }
    public Boolean getActivo() { return activo; } public void setActivo(Boolean activo) { this.activo = activo; }
}