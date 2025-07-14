package com.example.backend.repository;

import com.example.backend.DB.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VitalSignRepository extends JpaRepository<VitalSigns, Long> {
    List<VitalSigns> findByMeasurementTime(LocalDateTime measurementTime);

    // 특정 날짜 전체 조회
    @Query("SELECT v FROM VitalSigns v WHERE v.senior.id = :seniorId AND DATE(v.measurementTime) = :date ORDER BY v.measurementTime")
    List<VitalSigns> findBySeniorIdAndMeasurementDate(@Param("seniorId") Integer seniorId, @Param("date") LocalDate date);

    // 특정 날짜의 특정 ID 조회
    @Query("SELECT v FROM VitalSigns v WHERE v.senior.id = :seniorId AND DATE(v.measurementTime) = :date AND v.id = :vitalId")
    Optional<VitalSigns> findBySeniorIdAndDateAndId(
            @Param("seniorId") Integer seniorId,
            @Param("date") LocalDate date,
            @Param("vitalId") Long vitalId
    );

    // 날짜 범위 조회
    List<VitalSigns> findBySeniorIdAndMeasurementTimeBetween(
            Integer seniorId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

}
