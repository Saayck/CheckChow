package checkchow.back.repositories;

import checkchow.back.entity.OmrUnion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrUnionRepository extends JpaRepository<OmrUnion, Integer> {
}

