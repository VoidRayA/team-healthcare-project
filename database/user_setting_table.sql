-- user_setting 테이블 생성 SQL
USE `health_care`;

CREATE TABLE IF NOT EXISTS `user_setting` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '설정 고유 ID',
  `guardian_id` bigint(20) NOT NULL COMMENT '보호자 ID',
  `category` varchar(255) DEFAULT NULL COMMENT '카테고리',
  `sub_category` varchar(255) DEFAULT NULL COMMENT '서브 카테고리',
  `values` text DEFAULT NULL COMMENT '설정 값',
  `created_at` datetime DEFAULT current_timestamp() COMMENT '생성일',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일',
  PRIMARY KEY (`id`),
  KEY `idx_guardian_category` (`guardian_id`, `category`),
  KEY `idx_category_subcategory` (`category`, `sub_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='사용자 설정 관리';

-- 기본 드롭다운 항목 삽입 (예시)
INSERT INTO `user_setting` (`guardian_id`, `category`, `sub_category`, `values`) VALUES
(1, '일정관리', 'dropdown', '식사횟수'),
(1, '일정관리', 'dropdown', '운동시간'),
(1, '일정관리', 'dropdown', '복약여부'),
(1, '일정관리', 'dropdown', '혈압측정'),
(1, '일정관리', 'dropdown', '산책');
