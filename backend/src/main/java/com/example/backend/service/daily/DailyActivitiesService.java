package com.example.backend.service.daily;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/*
 * 활동기록 관련 서비스
 * */
@Service
@RequiredArgsConstructor
public class DailyActivitiesService {

    private final SeniorRepository seniorRepository;

    // 활동기록 생성 서비스
    public SeniorDto.SeniorDailyDto createDaily(Integer seniorId, DailyActivitiesDto dto, Guardians guardian) {
        // 기존 Senior 조회
        Seniors senior = seniorRepository.findById(seniorId)
                .orElseThrow(() -> new EntityNotFoundException("Senior not found"));

        // 활동 기록 생성
        DailyActivities dailyActivities = DailyActivities.builder()
                .senior(senior)
                .activityDate(dto.getActivityDate() != null ? dto.getActivityDate() : LocalDate.now())
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

        // Entity를 DTO로 변환하여 반환
        return convertToSeniorDailyDto(senior);
    }

    // 활동 기록 senior 전부와 특정 senior 조회 서비스
    // guardian이 관리하는 모든 senior 조회
    public SeniorDto.SeniorDailyListDto getListDaily(Integer seniorId, Guardians guardian) {
        List<Seniors> seniors = seniorRepository.findByGuardian(guardian);

        List<SeniorDto.SeniorDailyDto> seniorDtos = seniors.stream()
                .map(this::convertToSeniorDailyDto)
                .collect(Collectors.toList());

        return new SeniorDto.SeniorDailyListDto(seniorDtos);
    }

    // guardian이 관리하는 특정 senior 조회
    public SeniorDto.SeniorDailyDto getDaily(Integer seniorId, Integer activityId, Guardians guardian) {
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        return convertToSeniorDailyDto(senior);
    }

    // 활동 기록 삭제
    public SeniorDto.SeniorDailyDto deleteDaily(Integer seniorId, Integer activityId, Guardians guardian) {
        // 특정 senior 정보 조회
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        // 특정 senior의 dailyActivities를 가져옴
        List<DailyActivities> activities = Optional.ofNullable(senior.getActivities())
                .orElse(new ArrayList<>());

        // 삭제할 활동 찾기
        DailyActivities activityToDelete = activities.stream()
                .filter(a -> a.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("해당 활동을 찾을 수 없습니다."));

        // senior에서 activities 삭제
        senior.getActivities().remove(activityToDelete);
        activityToDelete.setSenior(null); // 양방향성 연관관계 해제

        // senior 저장
        seniorRepository.save(senior);

        // Entity를 DTO로 변환하여 반환
        return convertToSeniorDailyDto(senior);
    }

    /**
     * Seniors Entity를 SeniorDailyDto로 변환하는 헬퍼 메서드
     * 순환 참조를 방지하기 위해 Entity를 DTO로 변환
     */
    private SeniorDto.SeniorDailyDto convertToSeniorDailyDto(Seniors senior) {
        // 활동 기록들을 DTO로 변환
        List<SeniorDto.ActivityResponseDto> activitiesDto = Optional.ofNullable(senior.getActivities())
                .orElse(new ArrayList<>())
                .stream()
                .sorted(Comparator.comparing(DailyActivities::getCreatedAt).reversed()) // 생성일 기준 내림차순 정렬
                .map(activity -> SeniorDto.ActivityResponseDto.builder()
                        .id(activity.getId())
                        .seniorId(activity.getSenior().getId())
                        .activityDate(activity.getActivityDate())
                        .mealCount(activity.getMealCount())
                        .medicationTaken(activity.getMedicationTaken())
                        .outdoorActivity(activity.getOutdoorActivity())
                        .sleepQuality(activity.getSleepQuality())
                        .dailyNotes(activity.getDailyNotes())
                        .createdAt(activity.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SeniorDto.SeniorDailyDto.builder()
                .id(senior.getId())
                .seniorName(senior.getSeniorName())
                .dailyActivities(activitiesDto) // Entity 대신 DTO 사용
                .build();
    }
}