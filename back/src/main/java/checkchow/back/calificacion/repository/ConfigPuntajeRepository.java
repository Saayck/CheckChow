package checkchow.back.calificacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.calificacion.entity.ConfigPuntaje;

@Repository
public interface ConfigPuntajeRepository extends JpaRepository<ConfigPuntaje, Integer> {
}

