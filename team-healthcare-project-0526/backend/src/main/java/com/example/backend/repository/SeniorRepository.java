package com.example.backend.repository;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeniorRepository extends JpaRepository<Seniors, Integer> {

    // ===== Guardian 기반 조회 (가장 중요) =====

    /**
     * 특정 Guardian이 관리하는 활성화된 Senior 목록 조회
     */
    List<Seniors> findByGuardianAndIsActiveTrue(Guardians guardian);

    /**
     * 특정 Guardian이 관리하는 모든 Senior 목록 조회 (비활성화 포함)
     */
    List<Seniors> findByGuardian(Guardians guardian);

    /**
     * 특정 Guardian이 관리하는 Senior 목록 (페이징)
     */
    Page<Seniors> findByGuardianAndIsActiveTrue(Guardians guardian, Pageable pageable);

    // ===== Guardian ID 기반 조회 =====

    /**
     * Guardian ID로 Senior 목록 조회 (활성화된 것만)
     */
    @Query("SELECT s FROM Seniors s WHERE s.guardian.id = :guardianId AND s.isActive = true")
    List<Seniors> findByGuardianIdAndIsActiveTrue(@Param("guardianId") Integer guardianId);  // Integer -> Long으로 수정

    /**
     * Guardian ID로 특정 Senior 조회 (본인 소유 확인용)
     */
    @Query("SELECT s FROM Seniors s WHERE s.id = :seniorId AND s.guardian.id = :guardianId AND s.isActive = true")
    Optional<Seniors> findByIdAndGuardianId(@Param("seniorId") Integer seniorId, @Param("guardianId") Integer guardianId);  // Integer -> Long으로 수정

    // ===== 검색 기능 =====

    /**
     * 특정 Guardian이 관리하는 Senior 중 이름으로 검색
     */
    List<Seniors> findByGuardianAndSeniorNameContainingAndIsActiveTrue(
            Guardians guardian, String seniorName);

    /**
     * 이름으로 전체 검색 (관리자용)
     */
    List<Seniors> findBySeniorNameContainingAndIsActiveTrue(String seniorName);

    // ===== 기본 조회 =====

    /**
     * ID로 활성화된 Senior 조회
     */
    Optional<Seniors> findByIdAndIsActiveTrue(Integer id);

    /**
     * 모든 활성화된 Senior 조회
     */
    List<Seniors> findByIsActiveTrue();

    /**
     * 활성화된 Senior 개수 조회 (Guardian별)
     */
    long countByGuardianAndIsActiveTrue(Guardians guardian);

    /**
     * 활동 기록 중복 체크
     */
    @Query("SELECT COUNT(da) > 0 FROM DailyActivities da WHERE da.senior.id = :seniorId AND da.activityDate = :activityDate")
    boolean existsDailyActivityBySeniorIdAndDate(@Param("seniorId") Integer seniorId, @Param("activityDate") java.time.LocalDate activityDate);

    // ===== 통계/분석용 (나중에 활용) =====

    /**
     * 성별별 통계
     */
    @Query("SELECT s.gender, COUNT(s) FROM Seniors s WHERE s.guardian = :guardian AND s.isActive = true GROUP BY s.gender")
    List<Object[]> countByGenderAndGuardian(@Param("guardian") Guardians guardian);
}