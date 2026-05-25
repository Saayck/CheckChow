package checkchow.back.seguridad.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import checkchow.back.user.Usuario;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "sesion")
public class Sesion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispositivo_id")
    private Dispositivo dispositivo;

    @Column(unique = true, length = 512, nullable = false)
    private String token;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "fecha_inicio", nullable = false)
    private OffsetDateTime fechaInicio = OffsetDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private OffsetDateTime fechaExpiracion;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    
}
