package checkchow.back.repositories;

import checkchow.back.entity.OmrDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrDetalleRepository extends JpaRepository<OmrDetalle, Integer> {
}

