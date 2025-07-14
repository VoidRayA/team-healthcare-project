package com.example.backend.repository;

import com.example.backend.DB.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {

    /**
     * 카테고리와 guardian_id로 조회 (sub_category 순으로 정렬)
     */
    List<UserSetting> findByCategoryAndGuardianIdOrderBySubCategory(String category, Long guardianId);

    /**
     * sub_category와 guardian_id로 조회
     */
    Optional<UserSetting> findBySubCategoryAndGuardianId(String subCategory, Long guardianId);

    /**
     * 카테고리별 조회
     */
    List<UserSetting> findByCategoryOrderBySubCategory(String category);

    /**
     * guardian_id로 모든 설정 조회
     */
    List<UserSetting> findByGuardianIdOrderByCategoryAscSubCategoryAsc(Long guardianId);

    /**
     * 특정 카테고리와 sub_category 존재 여부 확인
     */
    boolean existsByCategoryAndSubCategoryAndGuardianId(String category, String subCategory, Long guardianId);

    /**
     * 카스텀 쿼리 - 드롭다운용 데이터 조회
     */
    @Query("SELECT us FROM UserSetting us WHERE us.category = :category AND us.guardianId = :guardianId AND us.values IS NOT NULL ORDER BY us.subCategory")
    List<UserSetting> findDropdownItemsByCategory(@Param("category") String category, @Param("guardianId") Long guardianId);

    /**
     * 카테고리, sub_category, guardian_id로 조회
     * 새로운 DB 구조에 맞게 추가된 메서드
     */
    List<UserSetting> findByCategoryAndSubCategoryAndGuardianId(String category, String subCategory, Long guardianId);

    /**
     * 카테고리, sub_category, guardian_id, values로 조회
     * 특정 값을 가진 레코드 찾기
     */
    Optional<UserSetting> findByCategoryAndSubCategoryAndGuardianIdAndValues(String category, String subCategory, Long guardianId, String values);
}