package com.litocodigo.web.repository;

import com.litocodigo.web.entity.ProcesoAdmision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcesoAdmisionRepository extends JpaRepository<ProcesoAdmision, Integer> {
}

