package checkchow.back.postulante.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.postulante.entity.FichaAlumno;

@Repository
public interface FichaAlumnoRepository extends JpaRepository<FichaAlumno, Integer> {
}

