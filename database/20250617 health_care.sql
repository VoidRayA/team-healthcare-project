-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        11.8.2-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- health_care 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `health_care` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `health_care`;

-- 테이블 health_care.alerts 구조 내보내기
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '알림 고유 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `alert_type` varchar(30) NOT NULL COMMENT 'emergency/warning/info',
  `title` varchar(200) NOT NULL COMMENT '알림 제목',
  `description` text DEFAULT NULL COMMENT '알림 내용',
  `related_vital_id` int(11) DEFAULT NULL COMMENT 'vital_signs 테이블 참조',
  `is_confirmed` tinyint(1) DEFAULT 0 COMMENT '확인 여부',
  `confirmed_by` int(11) DEFAULT NULL COMMENT '확인한 보호자 ID',
  `confirmed_at` datetime DEFAULT NULL COMMENT '확인 시간',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '알림 생성 시각',
  PRIMARY KEY (`id`),
  KEY `idx_senior_alert_time` (`senior_id`,`created_at`),
  KEY `idx_confirmed_status` (`is_confirmed`),
  KEY `related_vital_id` (`related_vital_id`),
  KEY `confirmed_by` (`confirmed_by`),
  CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`related_vital_id`) REFERENCES `vital_signs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `alerts_ibfk_3` FOREIGN KEY (`confirmed_by`) REFERENCES `guardians` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='알림 관리';

-- 테이블 데이터 health_care.alerts:~0 rows (대략적) 내보내기

-- 테이블 health_care.daily_activities 구조 내보내기
CREATE TABLE IF NOT EXISTS `daily_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '활동 기록 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `activity_date` date NOT NULL COMMENT '활동 날짜',
  `meal_count` int(11) DEFAULT 0 COMMENT '식사 횟수',
  `medication_taken` tinyint(1) DEFAULT 0 COMMENT '약 복용 여부',
  `outdoor_activity` tinyint(1) DEFAULT 0 COMMENT '외출 여부',
  `sleep_quality` varchar(10) DEFAULT NULL COMMENT '수면 상태 (good/normal/bad)',
  `daily_notes` text DEFAULT NULL COMMENT '일일 특이사항',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '기록 생성일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_senior_date` (`senior_id`,`activity_date`),
  CONSTRAINT `daily_activities_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='일일 활동 기록';

-- 테이블 데이터 health_care.daily_activities:~0 rows (대략적) 내보내기

-- 테이블 health_care.guardians 구조 내보내기
CREATE TABLE IF NOT EXISTS `guardians` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '보호자 고유 ID',
  `user_id` int(11) NOT NULL COMMENT 'users 테이블 참조',
  `relationship` varchar(30) DEFAULT NULL COMMENT '노인과의 관계',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '등록일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `guardians_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='보호자 기본 정보';

-- 테이블 데이터 health_care.guardians:~0 rows (대략적) 내보내기

-- 테이블 health_care.health_summaries 구조 내보내기
CREATE TABLE IF NOT EXISTS `health_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '요약 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `summary_date` date NOT NULL COMMENT '요약 기준일',
  `period_type` varchar(10) NOT NULL COMMENT 'weekly/monthly',
  `avg_blood_pressure_high` decimal(5,2) DEFAULT NULL COMMENT '평균 수축기 혈압',
  `avg_blood_pressure_low` decimal(5,2) DEFAULT NULL COMMENT '평균 이완기 혈압',
  `avg_heart_rate` decimal(5,2) DEFAULT NULL COMMENT '평균 심박수',
  `total_measurements` int(11) DEFAULT NULL COMMENT '총 측정 횟수',
  `abnormal_count` int(11) DEFAULT NULL COMMENT '이상 수치 횟수',
  `medication_compliance_rate` decimal(5,2) DEFAULT NULL COMMENT '복약 순응도 (%)',
  `health_status` varchar(20) DEFAULT NULL COMMENT 'good/normal/concern',
  `notes` text DEFAULT NULL COMMENT '특이사항',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '생성일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_summary` (`senior_id`,`summary_date`,`period_type`),
  CONSTRAINT `health_summaries_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='건강 요약 리포트';

-- 테이블 데이터 health_care.health_summaries:~0 rows (대략적) 내보내기

-- 테이블 health_care.medication_schedules 구조 내보내기
CREATE TABLE IF NOT EXISTS `medication_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '복약 일정 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `medication_name` varchar(100) NOT NULL COMMENT '약물명',
  `schedule_time` time NOT NULL COMMENT '복용 시간',
  `days_of_week` varchar(20) DEFAULT NULL COMMENT '복용 요일',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '활성 상태',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '등록일',
  PRIMARY KEY (`id`),
  KEY `idx_senior_active` (`senior_id`,`is_active`),
  CONSTRAINT `medication_schedules_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='복약 일정';

-- 테이블 데이터 health_care.medication_schedules:~0 rows (대략적) 내보내기

-- 테이블 health_care.notification_settings 구조 내보내기
CREATE TABLE IF NOT EXISTS `notification_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '설정 고유 ID',
  `guardian_id` int(11) NOT NULL COMMENT 'guardians 테이블 참조',
  `receive_emergency` tinyint(1) DEFAULT 1 COMMENT '응급 알림 수신',
  `receive_warning` tinyint(1) DEFAULT 1 COMMENT '경고 알림 수신',
  `receive_daily_report` tinyint(1) DEFAULT 0 COMMENT '일일 리포트 수신',
  `quiet_start_time` time DEFAULT NULL COMMENT '방해금지 시작 시간',
  `quiet_end_time` time DEFAULT NULL COMMENT '방해금지 종료 시간',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '설정 수정일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_guardian_id` (`guardian_id`),
  CONSTRAINT `notification_settings_ibfk_1` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='알림 수신 설정';

-- 테이블 데이터 health_care.notification_settings:~0 rows (대략적) 내보내기

-- 테이블 health_care.seniors 구조 내보내기
CREATE TABLE IF NOT EXISTS `seniors` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '노인 고유 ID',
  `user_id` int(11) NOT NULL COMMENT 'users 테이블 참조',
  `birth_date` date NOT NULL COMMENT '생년월일',
  `gender` char(1) DEFAULT NULL COMMENT '성별 (M/F)',
  `address` varchar(255) DEFAULT NULL COMMENT '주소',
  `emergency_contact` varchar(20) DEFAULT NULL COMMENT '비상연락처',
  `chronic_diseases` text DEFAULT NULL COMMENT '주요 지병',
  `medications` text DEFAULT NULL COMMENT '복용중인 주요 약물',
  `notes` text DEFAULT NULL COMMENT '특이사항',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '등록일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_birth_date` (`birth_date`),
  CONSTRAINT `seniors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='독거노인 기본정보';

-- 테이블 데이터 health_care.seniors:~0 rows (대략적) 내보내기

-- 테이블 health_care.senior_guardian_relations 구조 내보내기
CREATE TABLE IF NOT EXISTS `senior_guardian_relations` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '관계 고유 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `guardian_id` int(11) NOT NULL COMMENT 'guardians 테이블 참조',
  `is_primary` tinyint(1) DEFAULT 0 COMMENT '주 보호자 여부',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '관계 설정일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_senior_guardian` (`senior_id`,`guardian_id`),
  KEY `guardian_id` (`guardian_id`),
  CONSTRAINT `senior_guardian_relations_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `senior_guardian_relations_ibfk_2` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='노인-보호자 연결 관계';

-- 테이블 데이터 health_care.senior_guardian_relations:~0 rows (대략적) 내보내기

-- 테이블 health_care.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '사용자 고유 ID',
  `login_id` varchar(50) NOT NULL COMMENT '로그인 아이디',
  `login_pw` varchar(255) NOT NULL COMMENT '암호화된 비밀번호',
  `user_type` varchar(20) NOT NULL COMMENT 'senior(노인), guardian(보호자)',
  `name` varchar(50) NOT NULL COMMENT '사용자 이름',
  `phone` varchar(20) DEFAULT NULL COMMENT '연락처',
  `email` varchar(100) DEFAULT NULL COMMENT '이메일',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '계정 활성화 상태',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '계정 생성일',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '계정 수정일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_id` (`login_id`),
  KEY `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='시스템 사용자 통합 관리';

-- 테이블 데이터 health_care.users:~0 rows (대략적) 내보내기

-- 테이블 health_care.vital_signs 구조 내보내기
CREATE TABLE IF NOT EXISTS `vital_signs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '측정 고유 ID',
  `senior_id` int(11) NOT NULL COMMENT 'seniors 테이블 참조',
  `measurement_time` datetime NOT NULL COMMENT '측정 시각',
  `blood_pressure_high` int(11) DEFAULT NULL COMMENT '수축기 혈압 (mmHg)',
  `blood_pressure_low` int(11) DEFAULT NULL COMMENT '이완기 혈압 (mmHg)',
  `heart_rate` int(11) DEFAULT NULL COMMENT '심박수 (bpm)',
  `blood_sugar` int(11) DEFAULT NULL COMMENT '혈당 (mg/dL)',
  `body_temperature` decimal(4,2) DEFAULT NULL COMMENT '체온 (°C)',
  `is_normal` tinyint(1) DEFAULT 1 COMMENT '정상 범위 여부',
  `notes` text DEFAULT NULL COMMENT '특이사항',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '기록 시간',
  PRIMARY KEY (`id`),
  KEY `idx_senior_time` (`senior_id`,`measurement_time`),
  CONSTRAINT `vital_signs_ibfk_1` FOREIGN KEY (`senior_id`) REFERENCES `seniors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='생체신호 기록';

-- 테이블 데이터 health_care.vital_signs:~0 rows (대략적) 내보내기

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
