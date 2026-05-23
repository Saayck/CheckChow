package checkchow.back.calificacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.calificacion.entity.Calificacion;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {
}

