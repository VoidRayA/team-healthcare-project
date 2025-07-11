package com.example.backend.repository;

import com.example.backend.DB.Alerts;
import com.example.backend.DB.Seniors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertsRepository extends JpaRepository<Alerts, Integer> {
    // 특정 시니어의 미확인 알림 조회 (생성일 기준 내림차순)
    List<Alerts> findBySeniorsAndIsConfirmedFalseOrderByCreatedAtDesc(Seniors seniors);

    // 특정 시니어의 확인 알림 조회 (생성일 기준 내림차순)
    List<Alerts> findBySeniorsAndIsConfirmedOrderByCreatedAtDesc(Seniors senior, boolean isConfirmed);

    // 특정 시니어의 모든 알림 조회 (페이징)
    Page<Alerts> findBySeniorsOrderByCreatedAtDesc(Seniors seniors, Pageable pageable);

    // 특정 시니어의 특정 타입 미확인 알림 조회
    List<Alerts> findBySeniorsAndAlertTypeAndIsConfirmedFalseOrderByCreatedAtDesc(
            Seniors seniors, String alertType);

    // 특정 기간 내의 알림 조회
    List<Alerts> findBySeniorsAndCreatedAtBetweenOrderByCreatedAtDesc(
            Seniors seniors, LocalDateTime startDate, LocalDateTime endDate);

    // 특정 시니어의 긴급 알림 개수 조회
    @Query("SELECT COUNT(a) FROM Alerts a WHERE a.seniors = :seniors AND a.alertType = 'EMERGENCY' AND a.isConfirmed = false")
    Long countEmergencyAlerts(@Param("seniors") Seniors seniors);

    // 특정 시니어의 주의 알림 개수 조회
    @Query("SELECT COUNT(a) FROM Alerts a WHERE a.seniors = :seniors AND a.alertType = 'WARNING' AND a.isConfirmed = false")
    Long countWarningAlerts(@Param("seniors") Seniors seniors);

    // 특정 시니어의 미확인 알림 개수 조회
    Long countBySeniorsAndIsConfirmedFalse(Seniors seniors);

    // 특정 시니어의 확인된 알림 개수 조회
    Long countBySeniorsAndIsConfirmedTrue(Seniors seniors);

    // 특정 시니어의 전체 알림 개수 조회
    Long countBySeniors(Seniors seniors);

    // 최근 24시간 내 알림 조회
    @Query("SELECT a FROM Alerts a WHERE a.seniors = :seniors AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<Alerts> findRecentAlerts(@Param("seniors") Seniors seniors, @Param("since") LocalDateTime since);

    // 특정 VitalSigns와 연관된 알림 조회
    List<Alerts> findByVitalSignsVitalSignsId(Integer vitalSignsId);

    // 특정 타입의 알림 조회 (페이징)
    Page<Alerts> findBySeniorsAndAlertTypeOrderByCreatedAtDesc(
            Seniors seniors, String alertType, Pageable pageable);

    // 확인되지 않은 긴급 알림 조회 (모든 시니어 대상)
    @Query("SELECT a FROM Alerts a WHERE a.alertType = 'EMERGENCY' AND a.isConfirmed = false ORDER BY a.createdAt DESC")
    List<Alerts> findAllUnconfirmedEmergencyAlerts();

    // 특정 시니어의 알림 통계 조회
    @Query("SELECT a.alertType, COUNT(a) FROM Alerts a WHERE a.seniors = :seniors GROUP BY a.alertType")
    List<Object[]> getAlertStatistics(@Param("seniors") Seniors seniors);

    // 특정 기간 내의 일별 알림 통계 조회
    @Query("SELECT DATE(a.createdAt), COUNT(a) FROM Alerts a WHERE a.seniors = :seniors AND a.createdAt BETWEEN :startDate AND :endDate GROUP BY DATE(a.createdAt)")
    List<Object[]> getAlertStatisticsByDate(@Param("seniors") Seniors seniors, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 최근 N일간의 알림 조회
    @Query("SELECT a FROM Alerts a WHERE a.seniors = :seniors AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<Alerts> findAlertsAfterDate(@Param("seniors") Seniors seniors, @Param("since") LocalDateTime since);
}
