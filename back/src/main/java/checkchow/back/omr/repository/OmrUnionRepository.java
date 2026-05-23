package checkchow.back.omr.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import checkchow.back.omr.entity.OmrUnion;

@Repository
public interface OmrUnionRepository extends JpaRepository<OmrUnion, Integer> {
        Optional<OmrUnion> findByLithocode(String lithocode);
}

