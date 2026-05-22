package checkchow.back.repositories;

import checkchow.back.entity.Postulante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostulanteRepository extends JpaRepository<Postulante, Integer> {
    Postulante findByDni(String dni);
    Postulante findByCodPostulante(String codPostulante);
}

