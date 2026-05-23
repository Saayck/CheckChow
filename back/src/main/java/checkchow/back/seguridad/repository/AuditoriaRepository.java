package checkchow.back.seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.seguridad.entity.Auditoria;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
}

