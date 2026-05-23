package checkchow.back.entity;

import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "sesion")
public class Sesion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id", nullable = false) private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "dispositivo_id") private Dispositivo dispositivo;
    @Column(unique = true, length = 512, nullable = false) private String token;
    @Column(nullable = false) private Boolean activa = true;
    @Column(name = "fecha_inicio", nullable = false) private OffsetDateTime fechaInicio = OffsetDateTime.now();
    @Column(name = "fecha_expiracion") private OffsetDateTime fechaExpiracion;
    @Column(name = "fecha_cierre") private OffsetDateTime fechaCierre;

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Dispositivo getDispositivo() { return dispositivo; } public void setDispositivo(Dispositivo dispositivo) { this.dispositivo = dispositivo; }
    public String getToken() { return token; } public void setToken(String token) { this.token = token; }
    public Boolean getActiva() { return activa; } public void setActiva(Boolean activa) { this.activa = activa; }
    public OffsetDateTime getFechaInicio() { return fechaInicio; } public void setFechaInicio(OffsetDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public OffsetDateTime getFechaExpiracion() { return fechaExpiracion; } public void setFechaExpiracion(OffsetDateTime fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
    public OffsetDateTime getFechaCierre() { return fechaCierre; } public void setFechaCierre(OffsetDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
}