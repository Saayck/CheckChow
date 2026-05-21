package com.litocodigo.web.repository;

import com.litocodigo.web.entity.FichaAlumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FichaAlumnoRepository extends JpaRepository<FichaAlumno, Integer> {
}

