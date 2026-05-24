package checkchow.back.seguridad.dto;

import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditoriaResponse {
    private Long id;
    private Long usuarioId;
    private Integer sesionId;
    private TAccion accion;
    private TMetodoHttp metodoHttp;
    private String endpoint;
    private String entidad;
    private String entidadId;
    private String valorAnterior;
    private String valorNuevo;
    private String ipOrigen;
    private String userAgent;
    private OffsetDateTime fecha;
}
