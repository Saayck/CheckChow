package com.litocodigo.web.repository;

import com.litocodigo.web.entity.ProcesoVacante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcesoVacanteRepository extends JpaRepository<ProcesoVacante, Integer> {
}

