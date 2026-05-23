package checkchow.back.omr.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.omr.entity.OmrIdentificacion;

@Repository
public interface OmrIdentificacionRepository extends JpaRepository<OmrIdentificacion, Integer> {
    Optional<OmrIdentificacion> findByLithocode(String lithocode);
}

