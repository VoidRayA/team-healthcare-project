package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.ActivityCategoryDto;
import com.example.backend.service.daily.ActivityCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seniors/{seniorId}/categories")
@RequiredArgsConstructor
public class ActivityCategoryController {

    private final ActivityCategoryService activityCategoryService;

    /**
     * 특정 Senior의 활동 카테고리 목록 조회
     */
    @GetMapping
    public ResponseEntity<ActivityCategoryDto.CategoryListResponseDto> getCategories(
            @PathVariable Integer seniorId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        ActivityCategoryDto.CategoryListResponseDto response =
                activityCategoryService.getCategories(seniorId, currentUser.getGuardians());
        return ResponseEntity.ok(response);
    }

    /**
     * 새로운 활동 카테고리 생성
     */
    @PostMapping
    public ResponseEntity<ActivityCategoryDto.CategoryResponseDto> createCategory(
            @PathVariable Integer seniorId,
            @RequestBody ActivityCategoryDto.CategoryCreateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        ActivityCategoryDto.CategoryResponseDto response =
                activityCategoryService.createCategory(seniorId, requestDto, currentUser.getGuardians());
        return ResponseEntity.ok(response);
    }

    /**
     * 활동 카테고리 삭제 (비활성화)
     */
    @DeleteMapping("/{categoryName}")
    public ResponseEntity<ActivityCategoryDto.CategoryListResponseDto> deleteCategory(
            @PathVariable Integer seniorId,
            @PathVariable String categoryName,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        ActivityCategoryDto.CategoryListResponseDto response =
                activityCategoryService.deleteCategory(seniorId, categoryName, currentUser.getGuardians());
        return ResponseEntity.ok(response);
    }

    /**
     * 활동 기록 생성 시 사용할 수 있는 카테고리 이름 목록 조회
     */
    @GetMapping("/active-names")
    public ResponseEntity<List<String>> getActiveCategoryNames(
            @PathVariable Integer seniorId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        List<String> categoryNames =
                activityCategoryService.getActiveCategoryNames(seniorId, currentUser.getGuardians());
        return ResponseEntity.ok(categoryNames);
    }
}
