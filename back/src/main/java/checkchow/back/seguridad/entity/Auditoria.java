package checkchow.back.seguridad.entity;

import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.user.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.net.InetAddress;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "auditoria")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id")
    private Sesion sesion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column
    private TAccion accion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "metodo_http")
    private TMetodoHttp metodoHttp;

    @Column(length = 255)
    private String endpoint;

    @Column(length = 100)
    private String entidad;

    @Column(name = "entidad_id")
    private String entidadId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valor_anterior")
    private String valorAnterior;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "valor_nuevo")
    private String valorNuevo;

    @JdbcTypeCode(SqlTypes.INET)
    @Column(name = "ip_origen", columnDefinition = "INET")
    private InetAddress ipOrigen;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(nullable = false)
    private OffsetDateTime fecha = OffsetDateTime.now();

    
}
