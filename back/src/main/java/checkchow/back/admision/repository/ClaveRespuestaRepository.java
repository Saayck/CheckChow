package checkchow.back.admision.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.admision.entity.ClaveRespuesta;

@Repository
public interface ClaveRespuestaRepository extends JpaRepository<ClaveRespuesta, Integer> {
    Optional<ClaveRespuesta> findByTemaIdAndNroPregunta(Integer temaId,Integer nroPregunta);
}
