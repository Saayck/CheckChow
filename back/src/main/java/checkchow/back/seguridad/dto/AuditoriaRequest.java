package checkchow.back.seguridad.dto;

import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuditoriaRequest {
    private Long usuarioId;
    private Integer sesionId;
    private TAccion accion;
    private TMetodoHttp metodoHttp;
    private String endpoint;
    private String entidad;
    private String entidadId;
    private String valorAnterior;
    private String valorNuevo;
}
