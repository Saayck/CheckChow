package checkchow.back.repositories;

import checkchow.back.entity.ConfigPuntaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigPuntajeRepository extends JpaRepository<ConfigPuntaje, Integer> {
}

