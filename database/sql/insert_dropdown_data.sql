-- =====================================================
-- Healthcare 프로젝트 - 드롭다운 데이터 삽입 스크립트
-- 작성일: 2025-07-08
-- 목적: 일정관리 페이지의 드롭다운 메뉴용 데이터 삽입
-- =====================================================

-- 기존 테스트 데이터가 있다면 삭제 (선택사항)
-- DELETE FROM user_setting WHERE category = '일정관리' AND sub_category = 'dropdown';

-- 드롭다운 메뉴용 데이터 삽입
-- guardian_id = 1 (테스트용 - 실제 guardian_id로 변경 필요)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', 'dropdown', '["식사횟수", "운동시간", "복약여부", "건강상태", "활동수준"]', NOW(), NOW());

-- 각 드롭다운 항목별 선택 옵션 데이터 (향후 확장용)
-- 현재는 values 컬럼에 JSON 배열로 저장하지만, 필요시 개별 레코드로 분리 가능

-- 식사횟수 옵션 (예시)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', '식사횟수', '["1회", "2회", "3회", "4회", "5회"]', NOW(), NOW());

-- 운동시간 옵션 (예시)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', '운동시간', '["30분", "1시간", "1시간 30분", "2시간", "2시간 이상"]', NOW(), NOW());

-- 복약여부 옵션 (예시)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', '복약여부', '["복용함", "복용 안함", "일부 복용", "지연 복용"]', NOW(), NOW());

-- 건강상태 옵션 (예시)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', '건강상태', '["좋음", "보통", "나쁨", "매우 나쁨"]', NOW(), NOW());

-- 활동수준 옵션 (예시)
INSERT INTO user_setting (guardian_id, category, sub_category, values, created_at, updated_at) VALUES
(1, '일정관리', '활동수준', '["활발함", "보통", "저조함", "거의 없음"]', NOW(), NOW());

-- =====================================================
-- 확인 쿼리
-- =====================================================
-- 삽입된 데이터 확인
SELECT 
    id,
    guardian_id,
    category,
    sub_category,
    values,
    created_at,
    updated_at
FROM user_setting 
WHERE category = '일정관리' 
ORDER BY sub_category, id;

-- 드롭다운 항목만 조회 (API에서 사용할 쿼리와 동일)
SELECT 
    id,
    sub_category,
    values
FROM user_setting 
WHERE category = '일정관리' 
  AND guardian_id = 1
  AND sub_category != 'dropdown'
ORDER BY sub_category;
