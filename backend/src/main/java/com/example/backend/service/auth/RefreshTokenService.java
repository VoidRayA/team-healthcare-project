package com.example.backend.service.auth;

import com.example.backend.DB.RefreshToken;
import com.example.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Refresh Token 관리 서비스
 * 만료된 토큰 정리, 보안 정책 적용 등을 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    
    /**
     * 만료된 리프레시 토큰 정리
     * 매일 새벽 3시에 실행
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // 1. 만료된 토큰 삭제
            refreshTokenRepository.deleteExpiredTokens(now);
            log.info("만료된 토큰 삭제 완료");
            
            // 2. 비활성화 후 30일 지난 토큰 삭제
            LocalDateTime thirtyDaysAgo = now.minusDays(30);
            refreshTokenRepository.deleteInactiveTokensOlderThan(thirtyDaysAgo);
            log.info("30일 이상 오래된 비활성 토큰 삭제 완료");
            
        } catch (Exception e) {
            log.error("토큰 정리 중 오류 발생", e);
        }
    }
    
    /**
     * 특정 사용자의 모든 리프레시 토큰 무효화
     * 비밀번호 변경, 계정 보안 이슈 등의 경우 사용
     * @param guardianId 보호자 ID
     */
    @Transactional
    public void revokeAllTokensForUser(Integer guardianId) {
        try {
            // 활성 토큰들을 비활성화
            List<RefreshToken> activeTokens = refreshTokenRepository
                    .findByGuardianIdAndIsActiveTrue(guardianId);
            
            activeTokens.forEach(token -> token.revoke("PASSWORD_CHANGED"));
            refreshTokenRepository.saveAll(activeTokens);
            
            log.info("사용자 {}의 {} 개 리프레시 토큰 무효화 완료", 
                    guardianId, activeTokens.size());
        } catch (Exception e) {
            log.error("토큰 무효화 중 오류 발생 - 사용자: {}", guardianId, e);
        }
    }
    
    /**
     * 의심스러운 토큰 사용 감지
     * 다른 IP나 디바이스에서 동일 토큰 사용 시도 감지
     * @param tokenId 토큰 ID
     * @param currentIp 현재 요청 IP
     * @param currentDevice 현재 요청 디바이스
     * @return 의심스러운 활동 여부
     */
    public boolean detectSuspiciousActivity(String tokenId, String currentIp, String currentDevice) {
        try {
            RefreshToken token = refreshTokenRepository.findByTokenId(tokenId).orElse(null);
            
            if (token == null) {
                return false;
            }
            
            // IP 주소가 다른 경우
            if (!currentIp.equals(token.getIpAddress())) {
                log.warn("다른 IP에서 토큰 사용 시도 감지 - 토큰: {}, 원래 IP: {}, 현재 IP: {}", 
                    tokenId.substring(0, 10) + "...", token.getIpAddress(), currentIp);
                return true;
            }
            
            // 디바이스 정보가 크게 다른 경우 (간단한 비교)
            if (currentDevice != null && token.getDeviceInfo() != null) {
                String originalDevice = token.getDeviceInfo().toLowerCase();
                String currentDeviceLower = currentDevice.toLowerCase();
                
                // 모바일 <-> 데스크탑 전환 감지
                boolean originalMobile = originalDevice.contains("mobile") || originalDevice.contains("android") || originalDevice.contains("iphone");
                boolean currentMobile = currentDeviceLower.contains("mobile") || currentDeviceLower.contains("android") || currentDeviceLower.contains("iphone");
                
                if (originalMobile != currentMobile) {
                    log.warn("다른 디바이스 타입에서 토큰 사용 시도 감지 - 토큰: {}", tokenId.substring(0, 10) + "...");
                    return true;
                }
            }
            
            return false;
        } catch (Exception e) {
            log.error("의심스러운 활동 감지 중 오류 발생", e);
            return false;
        }
    }
    
    /**
     * 오래 사용하지 않은 토큰 정리
     * 30일 이상 사용하지 않은 토큰 삭제
     */
    @Scheduled(cron = "0 0 4 * * SUN") // 매주 일요일 새벽 4시
    @Transactional
    public void cleanupInactiveTokens() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<RefreshToken> inactiveTokens = refreshTokenRepository.findAll().stream()
                    .filter(token -> {
                        LocalDateTime lastUsed = token.getLastUsedAt() != null ? token.getLastUsedAt() : token.getIssuedAt();
                        return lastUsed.isBefore(thirtyDaysAgo);
                    })
                    .toList();
            
            if (!inactiveTokens.isEmpty()) {
                refreshTokenRepository.deleteAll(inactiveTokens);
                log.info("30일 이상 미사용 리프레시 토큰 {} 개 삭제 완료", inactiveTokens.size());
            }
        } catch (Exception e) {
            log.error("미사용 토큰 정리 중 오류 발생", e);
        }
    }
}
