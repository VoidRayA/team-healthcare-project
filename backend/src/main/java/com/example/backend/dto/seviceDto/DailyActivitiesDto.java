package com.example.backend.dto.seviceDto;

import com.example.backend.DB.Seniors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 활동 기록 전송을 위한 DTO 클래스
 * */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivitiesDto {
    private Integer id;
    private Integer activitiesId;           // 고유 ID
    private Seniors senior;                 // senior 참조
    private LocalDate activityDate;         // 활동 날짜
    private int mealCount;                  // 식사 횟수
    private Byte medicationTaken;           // 약 복용 여부
    private Byte outdoorActivity;           // 외출 여부
    private String sleepQuality;            // 수면상태
    private String dailyNotes;              // 일일 특이사항
}
