package checkchow.back.calificacion.service;

import checkchow.back.calificacion.dto.CalificacionRequestDTO;
import checkchow.back.calificacion.dto.CalificacionResponseDTO;

import java.util.List;

public interface CalificacionService {

    CalificacionResponseDTO obtenerPorFicha(Integer fichaId);
    CalificacionResponseDTO calcularYGuardarCalificacion(Integer fichaId, Integer procesoId, String emailUsuario, CalificacionRequestDTO request);
    List<CalificacionResponseDTO> recalcularPorProceso(Integer procesoId, String emailUsuario);
}