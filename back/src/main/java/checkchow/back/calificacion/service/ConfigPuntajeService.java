package checkchow.back.calificacion.service;

import checkchow.back.calificacion.dto.ConfigPuntajeRequestDTO;
import checkchow.back.calificacion.entity.ConfigPuntaje;

public interface ConfigPuntajeService {
    ConfigPuntaje guardarOActualizarConfiguracion(Integer procesoId, String emailUsuario, ConfigPuntajeRequestDTO request);
    ConfigPuntaje restaurarPorDefecto(Integer procesoId, String emailUsuario);
    ConfigPuntaje obtenerConfiguracionActual(Integer procesoId);
}
