package checkchow.back.omr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.omr.entity.OmrDetalle;
import checkchow.back.omr.entity.OmrRespuesta;

@Repository
public interface OmrDetalleRepository extends JpaRepository<OmrDetalle, Integer> {
    void deleteByOmrRespuesta(OmrRespuesta omrRespuesta);
}
