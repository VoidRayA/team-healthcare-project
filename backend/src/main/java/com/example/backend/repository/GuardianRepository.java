package com.example.backend.repository;

import com.example.backend.DB.Guardians;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardians, Long> {
    List<Guardians> findByGuardianName(String guardianName);
    Optional<Guardians> findById(Integer id);
}