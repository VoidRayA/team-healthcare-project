-- Refresh Token 테이블 개선을 위한 마이그레이션
-- 실행 날짜: 2025-01-13

-- 1. 새로운 컬럼 추가
ALTER TABLE refresh_tokens 
ADD COLUMN IF NOT EXISTS revoked_at DATETIME,
ADD COLUMN IF NOT EXISTS revoke_reason VARCHAR(50);

-- 2. 인덱스 추가 (성능 향상)
-- 활성 토큰 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active_guardian 
ON refresh_tokens(is_active, guardian_id);

-- 비활성화된 토큰 정리를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked 
ON refresh_tokens(revoked_at, is_active);

-- 만료 시간 기준 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires 
ON refresh_tokens(expires_at);

-- 3. 기존 데이터 마이그레이션 (옵션)
-- 이미 is_active = false인 토큰들에 대해 revoked_at 설정
UPDATE refresh_tokens 
SET revoked_at = last_used_at,
    revoke_reason = 'MIGRATION'
WHERE is_active = false 
  AND revoked_at IS NULL;

-- 4. 통계 테이블 생성 (옵션 - 향후 분석용)
CREATE TABLE IF NOT EXISTS refresh_token_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    session_duration_minutes INT,
    login_date DATE,
    logout_date DATE,
    ip_address VARCHAR(45),
    device_type VARCHAR(50),
    revoke_reason VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 뷰 생성 (활성 세션 모니터링용)
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    rt.id,
    rt.guardian_id,
    g.guardian_name,
    g.login_id,
    rt.ip_address,
    rt.device_info,
    rt.issued_at,
    rt.last_used_at,
    TIMESTAMPDIFF(MINUTE, rt.issued_at, IFNULL(rt.last_used_at, NOW())) as session_duration_minutes
FROM refresh_tokens rt
JOIN guardians g ON rt.guardian_id = g.id
WHERE rt.is_active = true
  AND rt.expires_at > NOW()
ORDER BY rt.issued_at DESC;

-- 6. 저장 프로시저 (옵션 - 정리 작업용)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS cleanup_old_tokens()
BEGIN
    -- 만료된 토큰 삭제
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW();
    
    -- 30일 이상된 비활성 토큰 삭제
    DELETE FROM refresh_tokens 
    WHERE is_active = false 
      AND revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- 90일 이상된 모든 토큰 삭제 (컴플라이언스)
    DELETE FROM refresh_tokens 
    WHERE issued_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END//

DELIMITER ;

-- 7. 이벤트 스케줄러 활성화 (자동 정리)
SET GLOBAL event_scheduler = ON;

-- 8. 자동 정리 이벤트 생성
CREATE EVENT IF NOT EXISTS auto_cleanup_tokens
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 3 HOUR
DO CALL cleanup_old_tokens();
