package checkchow.back.repositories;

import checkchow.back.entity.OmrRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrRespuestaRepository extends JpaRepository<OmrRespuesta, Integer> {
}

