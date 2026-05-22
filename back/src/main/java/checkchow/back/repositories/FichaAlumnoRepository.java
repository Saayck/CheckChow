package checkchow.back.repositories;

import checkchow.back.entity.FichaAlumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FichaAlumnoRepository extends JpaRepository<FichaAlumno, Integer> {
}

