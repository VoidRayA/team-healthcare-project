-- Senior 테스트 데이터 삽입 쿼리
-- 먼저 users 테이블에 Senior 사용자 추가

-- 기존 테스트 데이터 정리 (필요시 주석 해제)
-- DELETE FROM senior_guardian_relations WHERE senior_id IN (SELECT id FROM seniors WHERE user_id IN (SELECT id FROM users WHERE login_id LIKE 'senior_test%'));
-- DELETE FROM seniors WHERE user_id IN (SELECT id FROM users WHERE login_id LIKE 'senior_test%');
-- DELETE FROM users WHERE login_id LIKE 'senior_test%';

-- Users 테이블에 Senior 사용자 추가
INSERT INTO users (login_id, login_pw, user_type, name, phone, email, is_active) VALUES
('senior_test01', '$2a$10$hashed_password_here', 'senior', '김영수', '010-1234-5678', 'youngsu.kim@email.com', 1),
('senior_test02', '$2a$10$hashed_password_here', 'senior', '이순자', '010-2345-6789', 'soonja.lee@email.com', 1),
('senior_test03', '$2a$10$hashed_password_here', 'senior', '박정희', '010-3456-7890', 'junghee.park@email.com', 1),
('senior_test04', '$2a$10$hashed_password_here', 'senior', '최금순', '010-4567-8901', 'geumsoon.choi@email.com', 1),
('senior_test05', '$2a$10$hashed_password_here', 'senior', '정태수', '010-5678-9012', 'taesoo.jung@email.com', 1),
('senior_test06', '$2a$10$hashed_password_here', 'senior', '홍길동', '010-6789-0123', 'gildong.hong@email.com', 1),
('senior_test07', '$2a$10$hashed_password_here', 'senior', '김복순', '010-7890-1234', 'boksoon.kim@email.com', 1),
('senior_test08', '$2a$10$hashed_password_here', 'senior', '이명자', '010-8901-2345', 'myungja.lee@email.com', 1),
('senior_test09', '$2a$10$hashed_password_here', 'senior', '박영철', '010-9012-3456', 'youngchul.park@email.com', 1),
('senior_test10', '$2a$10$hashed_password_here', 'senior', '강순옥', '010-0123-4567', 'soonok.kang@email.com', 1);

-- Seniors 테이블에 Senior 정보 추가 (부산의 다양한 지역 상세 주소 포함)
INSERT INTO seniors (user_id, birth_date, gender, address, emergency_contact, chronic_diseases, medications, notes) VALUES
((SELECT id FROM users WHERE login_id = 'senior_test01'), '1948-03-15', 'M', '부산광역시 해운대구 우동 1408-1 마린시티자이 201동 1502호', '010-1111-2222', '고혈압, 당뇨병', '아스피린, 메트포르민', '매일 아침 산책 권장'),
((SELECT id FROM users WHERE login_id = 'senior_test02'), '1950-07-22', 'F', '부산광역시 수영구 광안동 193-5 광안비치아파트 105동 803호', '010-2222-3333', '관절염, 골다공증', '칼슘제, 진통제', '계단 이용 시 주의 필요'),
((SELECT id FROM users WHERE login_id = 'senior_test03'), '1945-11-30', 'F', '부산광역시 부산진구 부전동 502-3 부전센트럴타워 1203호', '010-3333-4444', '심장질환, 고혈압', '혈압약, 심장약', '정기적인 심전도 검사 필요'),
((SELECT id FROM users WHERE login_id = 'senior_test04'), '1949-05-10', 'F', '부산광역시 동래구 온천동 1463-38 동래스카이뷰 305호', '010-4444-5555', '당뇨병', '인슐린 주사', '혈당 체크 매일 3회'),
((SELECT id FROM users WHERE login_id = 'senior_test05'), '1947-09-25', 'M', '부산광역시 남구 대연동 1765-1 대연힐스테이트 708동 1201호', '010-5555-6666', '고혈압, 전립선비대증', '혈압약, 전립선약', '야간 빈뇨 증상 있음'),
((SELECT id FROM users WHERE login_id = 'senior_test06'), '1946-02-14', 'M', '부산광역시 사하구 당리동 317-1 당리푸르지오 101동 504호', '010-6666-7777', '관절염, 천식', '관절약, 흡입기', '미세먼지 높은 날 외출 자제'),
((SELECT id FROM users WHERE login_id = 'senior_test07'), '1951-12-05', 'F', '부산광역시 금정구 장전동 418-1 장전현대아파트 203동 602호', '010-7777-8888', '골다공증, 우울증', '칼슘제, 항우울제', '정기적인 상담 치료 중'),
((SELECT id FROM users WHERE login_id = 'senior_test08'), '1948-08-18', 'F', '부산광역시 북구 화명동 2270 화명롯데캐슬 106동 1502호', '010-8888-9999', '당뇨병, 신장질환', '당뇨약, 신장약', '저염식 식단 관리 중'),
((SELECT id FROM users WHERE login_id = 'senior_test09'), '1944-06-30', 'M', '부산광역시 강서구 명지동 3207 명지오션시티 파라곤 202동 801호', '010-9999-0000', '치매 초기, 고혈압', '치매약, 혈압약', '인지 재활 프로그램 참여 중'),
((SELECT id FROM users WHERE login_id = 'senior_test10'), '1952-04-12', 'F', '부산광역시 기장군 정관읍 정관로 288 정관신도시아파트 301동 405호', '010-0000-1111', '고혈압, 고지혈증', '혈압약, 고지혈증약', '정기 혈액검사 필요');

-- 보호자와 Senior 연결 관계 설정 (기존 보호자가 있다면)
-- 