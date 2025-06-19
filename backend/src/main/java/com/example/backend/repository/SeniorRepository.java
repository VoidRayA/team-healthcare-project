package com.example.backend.repository;

import com.example.backend.DB.Guardian;
import com.example.backend.DB.Senior;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeniorRepository extends JpaRepository<Senior, Long> {
    Optional<Senior> findByEmail(String email);
    List<Senior> findByGuardiansContains(Guardian guardian);
    Optional<Senior> findById(Long id);
}
