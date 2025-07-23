-- user_setting 테이블 id 컬럼에 AUTO_INCREMENT 추가
USE `health_care`;

ALTER TABLE `user_setting` MODIFY COLUMN `id` bigint(20) NOT NULL AUTO_INCREMENT;