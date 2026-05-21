package com.litocodigo.web.repository;

import com.litocodigo.web.entity.ResultadoAdmision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultadoAdmisionRepository extends JpaRepository<ResultadoAdmision, Integer> {
}

