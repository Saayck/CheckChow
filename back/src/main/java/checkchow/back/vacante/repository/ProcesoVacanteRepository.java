package checkchow.back.vacante.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.vacante.entity.ProcesoVacante;

@Repository
public interface ProcesoVacanteRepository extends JpaRepository<ProcesoVacante, Integer> {
}

