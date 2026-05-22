package checkchow.back.repositories;

import checkchow.back.entity.ProcesoAdmision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcesoAdmisionRepository extends JpaRepository<ProcesoAdmision, Integer> {
}

