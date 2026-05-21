package com.litocodigo.web.repository;

import com.litocodigo.web.entity.OmrRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OmrRespuestaRepository extends JpaRepository<OmrRespuesta, Integer> {
}

