package checkchow.back.user;

import checkchow.back.enums.TRol;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "usuario")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 120, nullable = false) private String email;
    @Column(name = "password", length = 255, nullable = false) private String password;
    @Column(length = 100, nullable = false) private String nombre_completo;
    @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false) private TRol rol = TRol.CONSULTA;
    @Column(nullable = false) private Boolean activo = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private OffsetDateTime fechaCreacion = OffsetDateTime.now();
    @Column(name = "fecha_modificacion", nullable = false) private OffsetDateTime fechaModificacion = OffsetDateTime.now();

    public void setId(Long id) { this.id = id; }

    public void setEmail(String email) { this.email = email; }

    public void setPassword(String password) { this.password = password; }

    public void setNombre_completo(String nombre_completo) { this.nombre_completo = nombre_completo; }

    public void setRol(TRol rol) { this.rol = rol; }

    public void setActivo(Boolean activo) { this.activo = activo; }

    public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public void setFechaModificacion(OffsetDateTime fechaModificacion) { this.fechaModificacion = fechaModificacion; }
}