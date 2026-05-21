package com.litocodigo.web.repository;

import com.litocodigo.web.entity.OmrUnion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrUnionRepository extends JpaRepository<OmrUnion, Integer> {
}

