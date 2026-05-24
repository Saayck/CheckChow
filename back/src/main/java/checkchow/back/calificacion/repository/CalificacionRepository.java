package checkchow.back.calificacion.repository;

import checkchow.back.calificacion.entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {
    Optional<Calificacion> findByFichaId(Integer fichaId);
    List<Calificacion> findByProcesoId(Integer procesoId);
}