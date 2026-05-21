package com.litocodigo.web.repository;

import com.litocodigo.web.entity.OmrIdentificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrIdentificacionRepository extends JpaRepository<OmrIdentificacion, Integer> {
}

