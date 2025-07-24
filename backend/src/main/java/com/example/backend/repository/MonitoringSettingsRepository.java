package com.example.backend.repository;

import com.example.backend.DB.MonitoringSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonitoringSettingsRepository extends JpaRepository<MonitoringSettings, Long> {
    
    Optional<MonitoringSettings> findByGuardianId(Integer guardianId);
    
    boolean existsByGuardianId(Integer guardianId);
}