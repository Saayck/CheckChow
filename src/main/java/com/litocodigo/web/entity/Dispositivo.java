package com.litocodigo.web.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dispositivo")
public class Dispositivo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id", nullable = false) private Usuario usuario;
    @Column(name = "sistema_operativo", length = 100) private String sistemaOperativo;
    @Column(name = "user_agent", columnDefinition = "TEXT") private String userAgent;
    @Column(name = "ip_registro", columnDefinition = "INET") private String ipRegistro;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getSistemaOperativo() { return sistemaOperativo; } public void setSistemaOperativo(String sistemaOperativo) { this.sistemaOperativo = sistemaOperativo; }
    public String getUserAgent() { return userAgent; } public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public String getIpRegistro() { return ipRegistro; } public void setIpRegistro(String ipRegistro) { this.ipRegistro = ipRegistro; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}