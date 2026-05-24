package checkchow.back.calificacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.calificacion.entity.ConfigPuntaje;

import java.util.Optional;

@Repository
public interface ConfigPuntajeRepository extends JpaRepository<ConfigPuntaje, Integer> {
    Optional<ConfigPuntaje> findByProcesoId(Integer procesoId);
}

