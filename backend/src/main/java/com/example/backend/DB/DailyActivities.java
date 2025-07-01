package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/*
* 활동 기록 관련 테이블
* senior 참조
* 활동 날짜
* 식사 횟수
* 약 복용 여부
* 외출 여부
* 수면 상태 (good, normal, bad)
* 일일 특이사항
* 기록 생성일
* */
@Entity
@Table(name = "daily_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivities {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senior_id")
    private Seniors senior;

    @Column(name = "activity_date")
    private LocalDate activityDate;

    @Column(name = "meal_count")
    private int mealCount;

    @Column(name = "medication_taken")
    private Byte medicationTaken;

    @Column(name = "outdoor_activity")
    private Byte outdoorActivity;

    @Column(name = "sleep_quality")
    private String sleepQuality;

    @Column(name = "daily_notes")
    private String dailyNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
