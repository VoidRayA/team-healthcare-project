package com.example.backend.domain.repository;

import com.example.backend.domain.DB.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    Optional<Guardian> findByEmail(String email);
}
