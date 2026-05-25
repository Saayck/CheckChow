package checkchow.back.seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.seguridad.entity.Sesion;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Integer> {
    Optional<Sesion> findByToken(String token);
    List<Sesion> findByUsuarioEmailAndActivaTrueAndFechaCierreIsNull(String email);
    List<Sesion> findByActivaTrueAndFechaCierreIsNullAndFechaExpiracionBefore(OffsetDateTime fecha);
    List<Sesion> findByTokenStartingWithAndActivaTrueAndFechaCierreIsNull(String tokenPrefix);
}
