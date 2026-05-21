package com.litocodigo.web.repository;

import com.litocodigo.web.entity.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Integer> {
}

