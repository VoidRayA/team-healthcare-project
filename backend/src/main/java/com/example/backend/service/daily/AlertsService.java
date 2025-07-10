package com.example.backend.service.daily;

import com.example.backend.DB.Alerts;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.VitalSigns;
import com.example.backend.dto.seviceDto.AlertsDto;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.repository.VitalSignRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AlertsService {

    private final VitalSignRepository vitalSignRepository;

    // 생성 서비스
    public AlertsDto.AlertsCreateDto createDto(Integer vitalSignsId, String customTitle, String customDescription){
        VitalSigns vitalSigns = vitalSignRepository.findById(vitalSignsId)
                .orElseThrow(() -> new EntityNotFoundException("VitalSigns 찾을 수 없습니다."));

        String title = customTitle != null ? customTitle : generateAutoTitle(vitalSigns, alertType);
        String description = customDescription != null ? customDescription : generateAutoDescription(vitalSigns, alertType);

        Alerts alerts = Alerts.builder()
                .alertType(alertType.name())
                .title(title)
                .description(description)
                .seniors(vitalSigns.getSenior())
                .vitalSigns(vitalSigns)
                .isConfirmed(false)
                .createdAt(LocalDateTime.now())
                .build();
        return
    }
    // 보호자 확인용 서비스(미확인) 및 확인 홈화면에서 구현

    // 보호자에게 전달하는 서비스

    // 삭제 서비스




    // 제목 자동 생성

    // 내용 자동 생성

    // 알림 타입 설정
}
