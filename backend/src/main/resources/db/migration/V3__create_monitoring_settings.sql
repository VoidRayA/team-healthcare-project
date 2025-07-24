-- 모니터링 설정 테이블 생성
CREATE TABLE monitoring_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guardian_id BIGINT NOT NULL,
    
    -- 혈압 (수축기) 기준치
    blood_pressure_attention_max INT DEFAULT 180,
    blood_pressure_attention_min INT DEFAULT 90,
    blood_pressure_caution_max INT DEFAULT 140,
    blood_pressure_caution_min INT DEFAULT 100,
    
    -- 혈압 (이완기) 기준치
    diastolic_attention_max INT DEFAULT 110,
    diastolic_attention_min INT DEFAULT 60,
    diastolic_caution_max INT DEFAULT 90,
    diastolic_caution_min INT DEFAULT 65,
    
    -- 심박수 기준치
    heart_rate_attention_max INT DEFAULT 100,
    heart_rate_attention_min INT DEFAULT 50,
    heart_rate_caution_max INT DEFAULT 90,
    heart_rate_caution_min INT DEFAULT 60,
    
    -- 체온 기준치 (소수점 1자리)
    body_temperature_attention_max DECIMAL(4,1) DEFAULT 38.0,
    body_temperature_attention_min DECIMAL(4,1) DEFAULT 35.5,
    body_temperature_caution_max DECIMAL(4,1) DEFAULT 37.5,
    body_temperature_caution_min DECIMAL(4,1) DEFAULT 36.0,
    
    -- 혈당 기준치
    blood_sugar_attention_max INT DEFAULT 250,
    blood_sugar_attention_min INT DEFAULT 70,
    blood_sugar_caution_max INT DEFAULT 180,
    blood_sugar_caution_min INT DEFAULT 80,
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건
    FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
    
    -- 유니크 제약조건 (사용자당 하나의 설정만)
    UNIQUE KEY unique_guardian_settings (guardian_id)
);