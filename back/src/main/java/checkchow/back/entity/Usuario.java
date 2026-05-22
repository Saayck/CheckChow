package checkchow.back.entity;

import checkchow.back.enums.TRol;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true, length = 50, nullable = false) private String username;
    @Column(unique = true, length = 120, nullable = false) private String email;
    @Column(name = "password_hash", length = 255, nullable = false) private String passwordHash;
    @Column(length = 100, nullable = false) private String nombre;
    @Column(length = 100, nullable = false) private String apellidos;
    
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false) private TRol rol = TRol.CONSULTA;
    @Column(nullable = false) private Boolean activo = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();
    @Column(name = "fecha_modificacion", nullable = false) private OffsetDateTime fechaModificacion = OffsetDateTime.now();

    public Integer getId() { return id; } public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; } public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; } public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getNombre() { return nombre; } public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; } public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public TRol getRol() { return rol; } public void setRol(TRol rol) { this.rol = rol; }
    public Boolean getActivo() { return activo; } public void setActivo(Boolean activo) { this.activo = activo; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public OffsetDateTime getFechaModificacion() { return fechaModificacion; } public void setFechaModificacion(OffsetDateTime fechaModificacion) { this.fechaModificacion = fechaModificacion; }
}