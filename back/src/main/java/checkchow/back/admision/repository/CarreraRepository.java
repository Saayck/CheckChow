package checkchow.back.admision.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.admision.entity.Carrera;

@Repository
public interface CarreraRepository extends JpaRepository<Carrera, Integer> {
    Optional<Carrera> findByCodigo(String codigo);
    
}

