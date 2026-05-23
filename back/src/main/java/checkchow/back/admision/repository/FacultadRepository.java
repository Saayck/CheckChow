package checkchow.back.admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.admision.entity.Facultad;

@Repository
public interface FacultadRepository extends JpaRepository<Facultad, Integer> {
}

