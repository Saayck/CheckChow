package checkchow.back.omr.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.omr.entity.OmrRespuesta;

@Repository
public interface OmrRespuestaRepository extends JpaRepository<OmrRespuesta, Integer> {
    Optional<OmrRespuesta> findByLithocode(String lithocode);
}

