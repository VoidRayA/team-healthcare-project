package com.example.backend.service.daily;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


/*
* 활동기록 관련 서비스
* */
@Service
@RequiredArgsConstructor
public class DailyActivitiesService {

    private final SeniorRepository seniorRepository;
    private Guardians guardian;

    // 활동기록 생성 서비스
    public SeniorDto.SeniorDailyDto createDaily(DailyActivitiesDto dto) {
        // 기존 Senior 조회
        Seniors senior = seniorRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Senior not found"));

        // 활동 기록 생성
        DailyActivities dailyActivities = DailyActivities.builder()
                .senior(senior)
                .activityDate(dto.getActivityDate())
                .mealCount(dto.getMealCount())
                .medicationTaken(dto.getMedicationTaken())
                .outdoorActivity(dto.getOutdoorActivity())
                .sleepQuality(dto.getSleepQuality())
                .dailyNotes(dto.getDailyNotes())
                .createdAt(LocalDateTime.now())
                .build();

        // Senior에 활동 기록 추가 (양방향 연관관계 설정)
        senior.addDailyActivity(dailyActivities);

        // 저장
        seniorRepository.save(senior);

        // 응답 DTO 생성
        return new SeniorDto.SeniorDailyDto(
                senior.getId(),
                senior.getSeniorName(),
                dailyActivities
        );
    }
    // 활동 기록 senior 전부와 특정 senior 조회 서비스
    // guardian이 관리하는 모든 senior 조회
//    public SeniorDto.SeniorDailyDto getDaily(DailyActivitiesDto dto) {
//        List<Seniors> seniors = seniorRepository.findByGuardian(guardian);
//
//        List<DailyActivities> allDailyActivities = new ArrayList<>();
//        for (Seniors senior : seniors) {
//            if (senior.getDailyActivities() != null) {
//                allDailyActivities.addAll(senior.getDailyActivities());
//            }
//        }
//
////        return new SeniorDto.SeniorDailyDto()
//    }

    // guardian이 관리하는 특정 senior 조회

}
