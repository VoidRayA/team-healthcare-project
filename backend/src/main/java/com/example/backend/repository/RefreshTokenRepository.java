package com.example.backend.repository;

import com.example.backend.DB.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByTokenId(String tokenId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.guardianId = :guardianId")
    void deleteByGuardianId(@Param("guardianId") Integer guardianId);
    
    @Modifying
    @Transactional
    void deleteByTokenId(String tokenId);
    
    // 활성 상태인 토큰 조회
    Optional<RefreshToken> findByTokenIdAndIsActiveTrue(String tokenId);
    
    // 사용자의 활성 토큰 조회
    List<RefreshToken> findByGuardianIdAndIsActiveTrue(Integer guardianId);
    
    // 비활성화 후 특정 기간이 지난 토큰 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.isActive = false AND r.revokedAt < :date")
    void deleteInactiveTokensOlderThan(@Param("date") LocalDateTime date);
    
    // 만료된 토큰 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}