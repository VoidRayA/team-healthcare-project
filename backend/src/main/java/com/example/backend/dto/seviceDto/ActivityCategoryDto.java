package com.example.backend.dto.seviceDto;

import com.example.backend.DB.care.ActivityCategory;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
public class ActivityCategoryDto {

    /**
     * 카테고리 생성 요청 DTO
     */
    @Builder
    public record CategoryCreateRequestDto(
            String categoryName,
            String description
    ) {}

    /**
     * 카테고리 응답 DTO
     */
    @Builder
    public record CategoryResponseDto(
            String categoryName,
            String description,
            boolean isActive
    ) {
        public static CategoryResponseDto from(ActivityCategory category) {
            return CategoryResponseDto.builder()
                    .categoryName(category.getCategoryName())
                    .description(category.getDescription())
                    .isActive(category.isActive())
                    .build();
        }
    }

    /**
     * 카테고리 목록 응답 DTO
     */
    @Builder
    public record CategoryListResponseDto(
            List<CategoryResponseDto> categories
    ) {
        public static CategoryListResponseDto from(List<ActivityCategory> categories) {
            return CategoryListResponseDto.builder()
                    .categories(categories.stream()
                            .map(CategoryResponseDto::from)
                            .toList())
                    .build();
        }
    }
}