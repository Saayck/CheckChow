package checkchow.back.repositories;

import checkchow.back.entity.CalificacionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalificacionDetalleRepository extends JpaRepository<CalificacionDetalle, Integer> {
}

