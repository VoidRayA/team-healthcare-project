package com.example.backend.repository;

import com.example.backend.DB.Guardians;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardians, Long> {
    Optional<Guardians> findByUserId(Integer id);
    Optional<Guardians> findByGuardianName(String guardianName);
    Optional<Guardians> findById(Long id);
}