package com.example.backend.domain.repository;

import com.example.backend.domain.DB.Guardian;
import com.example.backend.domain.DB.Senior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeniorRepository extends JpaRepository<Senior, Long> {
    Senior findByEmail(String email);
    List<Senior> findByGuardiansContains(Guardian guardian);
}
