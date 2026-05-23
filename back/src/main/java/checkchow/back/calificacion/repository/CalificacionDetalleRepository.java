package checkchow.back.calificacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.calificacion.entity.CalificacionDetalle;

@Repository
public interface CalificacionDetalleRepository extends JpaRepository<CalificacionDetalle, Integer> {
}

