package checkchow.back.seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.seguridad.entity.Sesion;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Integer> {
}

