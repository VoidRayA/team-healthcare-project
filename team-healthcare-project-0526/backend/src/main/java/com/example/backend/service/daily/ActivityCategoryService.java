package com.example.backend.service.daily;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.ActivityCategory;
import com.example.backend.dto.seviceDto.ActivityCategoryDto;
import com.example.backend.repository.SeniorRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityCategoryService {

    private final SeniorRepository seniorRepository;
    private final ObjectMapper objectMapper;

    /**
     * 특정 Senior의 활동 카테고리 조회
     * Senior의 dailyActivities 컬럼에서 JSON 형태로 저장된 카테고리 목록을 파싱
     */
    @Transactional(readOnly = true)
    public ActivityCategoryDto.CategoryListResponseDto getCategories(Integer seniorId, Guardians guardian) {
        // Senior 조회 (권한 체크 포함)
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없거나 접근 권한이 없습니다."));

        List<ActivityCategory> categories = parseCategoriesFromJson(senior.getDailyActivities());

        // 카테고리가 없으면 기본 카테고리 반환
        if (categories.isEmpty()) {
            categories = ActivityCategory.getDefaultCategories();
        }

        return ActivityCategoryDto.CategoryListResponseDto.from(categories);
    }

    /**
     * 특정 Senior에 새로운 활동 카테고리 생성
     * 기존 카테고리 목록에 새 카테고리를 추가하고 JSON으로 저장
     */
    @Transactional
    public ActivityCategoryDto.CategoryResponseDto createCategory(
            Integer seniorId,
            ActivityCategoryDto.CategoryCreateRequestDto requestDto,
            Guardians guardian
    ) {
        // Senior 조회 (권한 체크 포함)
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없거나 접근 권한이 없습니다."));

        // 기존 카테고리 목록 조회
        List<ActivityCategory> existingCategories = parseCategoriesFromJson(senior.getDailyActivities());

        // 기존 카테고리가 없으면 기본 카테고리로 초기화
        if (existingCategories.isEmpty()) {
            existingCategories = new ArrayList<>(ActivityCategory.getDefaultCategories());
        }

        // 중복 체크
        boolean isDuplicate = existingCategories.stream()
                .anyMatch(category -> category.getCategoryName().equals(requestDto.categoryName()));

        if (isDuplicate) {
            throw new IllegalArgumentException("이미 존재하는 카테고리입니다: " + requestDto.categoryName());
        }

        // 새 카테고리 생성
        ActivityCategory newCategory = ActivityCategory.builder()
                .categoryName(requestDto.categoryName())
                .description(requestDto.description())
                .isActive(true)
                .build();

        // 기존 목록에 추가
        existingCategories.add(newCategory);

        // JSON으로 변환하여 저장
        String categoriesJson = convertCategoriesToJson(existingCategories);
        senior.setDailyActivities(categoriesJson);

        // 저장
        seniorRepository.save(senior);

        return ActivityCategoryDto.CategoryResponseDto.from(newCategory);
    }

    /**
     * 특정 Senior의 활동 카테고리 삭제
     * 카테고리를 비활성화하여 이후 활동 기록에서 사용할 수 없도록 함
     */
    @Transactional
    public ActivityCategoryDto.CategoryListResponseDto deleteCategory(
            Integer seniorId,
            String categoryName,
            Guardians guardian
    ) {
        // Senior 조회 (권한 체크 포함)
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없거나 접근 권한이 없습니다."));

        // 기존 카테고리 목록 조회
        List<ActivityCategory> categories = parseCategoriesFromJson(senior.getDailyActivities());

        // 삭제할 카테고리 찾기
        ActivityCategory targetCategory = categories.stream()
                .filter(category -> category.getCategoryName().equals(categoryName))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("해당 카테고리를 찾을 수 없습니다: " + categoryName));

        // 카테고리 비활성화 (완전 삭제 대신 비활성화)
        targetCategory.setActive(false);

        // JSON으로 변환하여 저장
        String categoriesJson = convertCategoriesToJson(categories);
        senior.setDailyActivities(categoriesJson);

        // 저장
        seniorRepository.save(senior);

        // 활성화된 카테고리만 반환
        List<ActivityCategory> activeCategories = categories.stream()
                .filter(ActivityCategory::isActive)
                .collect(Collectors.toList());

        return ActivityCategoryDto.CategoryListResponseDto.from(activeCategories);
    }

    /**
     * 활동 기록 생성 시 사용할 수 있는 활성화된 카테고리 목록 조회
     */
    @Transactional(readOnly = true)
    public List<String> getActiveCategoryNames(Integer seniorId, Guardians guardian) {
        ActivityCategoryDto.CategoryListResponseDto response = getCategories(seniorId, guardian);
        return response.categories().stream()
                .filter(ActivityCategoryDto.CategoryResponseDto::isActive)
                .map(ActivityCategoryDto.CategoryResponseDto::categoryName)
                .collect(Collectors.toList());
    }

    // ==== 헬퍼 메서드들 ====

    /**
     * JSON 문자열을 ActivityCategory 목록으로 파싱
     */
    private List<ActivityCategory> parseCategoriesFromJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return objectMapper.readValue(jsonString, new TypeReference<List<ActivityCategory>>() {});
        } catch (JsonProcessingException e) {
            System.err.println("카테고리 JSON 파싱 실패: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * ActivityCategory 목록을 JSON 문자열로 변환
     */
    private String convertCategoriesToJson(List<ActivityCategory> categories) {
        try {
            return objectMapper.writeValueAsString(categories);
        } catch (JsonProcessingException e) {
            System.err.println("카테고리 JSON 변환 실패: " + e.getMessage());
            return "[]";
        }
    }
}
