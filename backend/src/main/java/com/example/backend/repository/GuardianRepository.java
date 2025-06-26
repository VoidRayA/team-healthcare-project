package com.example.backend.repository;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Role;                // ✅ Role import 추가
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Guardian 엔티티에 대한 데이터 접근 계층
 */
@Repository
public interface GuardianRepository extends JpaRepository<Guardians, Long> {

    /**
     * 로그인 ID로 보호자 조회
     * @param loginId 로그인 ID
     * @return Optional<Guardians>
     */
    Optional<Guardians> findByLoginId(String loginId);

    /**
     * 이메일로 보호자 조회
     * @param email 이메일
     * @return Optional<Guardians>
     */
    Optional<Guardians> findByEmail(String email);

    /**
     * 활성 보호자들의 페이징 조회
     * @param pageable 페이징 정보
     * @return Page<Guardians>
     */
    Page<Guardians> findByIsActiveTrue(Pageable pageable);

    /**
     * 보호자 이름으로 검색 (활성 계정만)
     * @param guardianName 보호자 이름
     * @return List<Guardians>
     */
    List<Guardians> findByGuardianNameContainingAndIsActiveTrue(String guardianName);

    /**
     * 역할별 보호자 조회 (활성 계정만)
     * @param role 역할
     * @return List<Guardians>
     */
    List<Guardians> findByRoleAndIsActiveTrue(Role role);        // ✅ 기존 Role enum 사용

    /**
     * 관계별 보호자 조회 (활성 계정만)
     * @param relationship 관계
     * @return List<Guardians>
     */
    List<Guardians> findByRelationshipAndIsActiveTrue(String relationship);
}