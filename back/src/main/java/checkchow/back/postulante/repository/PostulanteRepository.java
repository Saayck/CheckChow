package checkchow.back.postulante.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import checkchow.back.postulante.entity.Postulante;

@Repository
public interface PostulanteRepository extends JpaRepository<Postulante, Integer> {
    Postulante findByDni(String dni);

    Optional<Postulante> findByCodPostulante(String codPostulante);

}