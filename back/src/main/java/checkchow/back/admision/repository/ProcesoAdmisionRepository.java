package checkchow.back.admision.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.admision.entity.ProcesoAdmision;

@Repository
public interface ProcesoAdmisionRepository extends JpaRepository<ProcesoAdmision, Integer> {
    Optional<ProcesoAdmision> findByCodigo(String codigo);

    Optional<ProcesoAdmision> findByAnioAndPeriodo(Integer anio,String periodo);

    List<ProcesoAdmision> findByCreadoPorIsNull();
}
