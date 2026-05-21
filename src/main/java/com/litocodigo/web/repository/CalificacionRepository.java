package com.litocodigo.web.repository;

import com.litocodigo.web.entity.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {
}

