package checkchow.back.admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.admision.entity.ResultadoAdmision;

@Repository
public interface ResultadoAdmisionRepository extends JpaRepository<ResultadoAdmision, Integer> {
}

