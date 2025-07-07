package com.example.backend.DB;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 활동 카테고리 관리를 위한 엔티티
 * 실제 테이블은 없고, 메모리상에서 카테고리 관리
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityCategory {
    private String categoryName;
    private String description;
    private boolean isActive;

    // 기본 카테고리 목록 제공
    public static List<ActivityCategory> getDefaultCategories() {
        return List.of(
                ActivityCategory.builder()
                        .categoryName("식사")
                        .description("식사 관련 활동")
                        .isActive(true)
                        .build(),
                ActivityCategory.builder()
                        .categoryName("약물복용")
                        .description("처방약 및 건강보조제 복용")
                        .isActive(true)
                        .build(),
                ActivityCategory.builder()
                        .categoryName("외출")
                        .description("외출 및 사회활동")
                        .isActive(true)
                        .build(),
                ActivityCategory.builder()
                        .categoryName("수면")
                        .description("수면 및 휴식")
                        .isActive(true)
                        .build()
        );
    }
}