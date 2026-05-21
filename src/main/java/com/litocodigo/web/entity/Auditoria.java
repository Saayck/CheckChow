package com.litocodigo.web.entity;

import com.litocodigo.web.enums.TAccion;
import com.litocodigo.web.enums.TMetodoHttp;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "auditoria")
public class Auditoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id") private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sesion_id") private Sesion sesion;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(nullable = false) private TAccion accion;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Column(name = "metodo_http") private TMetodoHttp metodoHttp;
    @Column(length = 255) private String endpoint;
    @Column(length = 100) private String entidad;
    @Column(name = "entidad_id") private String entidadId;
    
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "valor_anterior") private String valorAnterior;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "valor_nuevo") private String valorNuevo;
    @Column(name = "ip_origen", columnDefinition = "INET") private String ipOrigen;
    @Column(name = "user_agent", columnDefinition = "TEXT") private String userAgent;
    @Column(nullable = false) private OffsetDateTime fecha = OffsetDateTime.now();

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Sesion getSesion() { return sesion; } public void setSesion(Sesion sesion) { this.sesion = sesion; }
    public TAccion getAccion() { return accion; } public void setAccion(TAccion accion) { this.accion = accion; }
    public TMetodoHttp getMetodoHttp() { return metodoHttp; } public void setMetodoHttp(TMetodoHttp metodoHttp) { this.metodoHttp = metodoHttp; }
    public String getEndpoint() { return endpoint; } public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public String getEntidad() { return entidad; } public void setEntidad(String entidad) { this.entidad = entidad; }
    public String getEntidadId() { return entidadId; } public void setEntidadId(String entidadId) { this.entidadId = entidadId; }
    public String getValorAnterior() { return valorAnterior; } public void setValorAnterior(String valorAnterior) { this.valorAnterior = valorAnterior; }
    public String getValorNuevo() { return valorNuevo; } public void setValorNuevo(String valorNuevo) { this.valorNuevo = valorNuevo; }
    public String getIpOrigen() { return ipOrigen; } public void setIpOrigen(String ipOrigen) { this.ipOrigen = ipOrigen; }
    public String getUserAgent() { return userAgent; } public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public OffsetDateTime getFecha() { return fecha; } public void setFecha(OffsetDateTime fecha) { this.fecha = fecha; }
}