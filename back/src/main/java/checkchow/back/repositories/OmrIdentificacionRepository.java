package checkchow.back.repositories;

import checkchow.back.entity.OmrIdentificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrIdentificacionRepository extends JpaRepository<OmrIdentificacion, Integer> {
}

