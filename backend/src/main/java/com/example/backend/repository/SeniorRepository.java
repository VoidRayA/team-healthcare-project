package com.example.backend.repository;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeniorRepository extends JpaRepository<Seniors, Long> {
//    Optional<Seniors> findByEmail(String email);
    List<Seniors> findByGuardiansContains(Guardians guardian);
    Optional<Seniors> findById(Long id);
}
