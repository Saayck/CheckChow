package checkchow.back.admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.admision.entity.ProcesoAdmision;

@Repository
public interface ProcesoAdmisionRepository extends JpaRepository<ProcesoAdmision, Integer> {
}

