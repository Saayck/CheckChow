package checkchow.back.repositories;

import checkchow.back.entity.ClaveRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaveRespuestaRepository extends JpaRepository<ClaveRespuesta, Integer> {
}

