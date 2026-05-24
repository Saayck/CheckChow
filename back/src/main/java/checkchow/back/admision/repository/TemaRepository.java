package checkchow.back.admision.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.admision.entity.Tema;

@Repository
public interface TemaRepository extends JpaRepository<Tema, Integer> {
    Optional<Tema> findByProcesoIdAndCodigo(Integer procesoId,String codigo);
}
