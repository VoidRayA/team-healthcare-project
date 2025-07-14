package com.example.backend.service.daily;

import com.example.backend.DB.Alerts;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.VitalSigns;
import com.example.backend.DB.care.VitalSignsThreshold;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.AlertsDto;
import com.example.backend.repository.AlertsRepository;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.repository.VitalSignRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertsService {

    private final VitalSignRepository vitalSignRepository;
    private final AlertsRepository alertsRepository;
    private final SeniorRepository seniorRepository;

    // 알림 생성및 보호자에게 전달하는 서비스(특이 사항이 생길 때만)
    public AlertsDto.AlertsCreateDto createDto(Integer vitalSignsId, String customTitle, String customDescription, CustomUserDetails currentUser){
        VitalSigns vitalSigns = vitalSignRepository.findById(vitalSignsId)
                .orElseThrow(() -> new EntityNotFoundException("VitalSigns 찾을 수 없습니다."));

        String alertType = VitalSignsThreshold.determineAlertType(vitalSigns);
        String title = customTitle != null ? customTitle : generateAutoTitle(vitalSigns, alertType);
        String description = customDescription != null ? customDescription : generateAutoDescription(vitalSigns, alertType);

        Guardians guardian = currentUser.getGuardians(); // `CustomUserDetails`에서 guardian 객체를 받아옴

        Alerts alerts = Alerts.builder()
                .alertType(alertType)
                .title(title)
                .description(description)
                .confirmedBy(guardian)  // `confirmedBy`에 보호자 객체 설정
                .seniors(vitalSigns.getSenior())
                .vitalSigns(vitalSigns)
                .isConfirmed(false)
                .createdAt(LocalDateTime.now())
                .build();

        // INFO(정상) 타입일 때는 알림 생성하지 않음
        if ("INFO".equals(alertType)) {
            return null; // 또는 예외 처리
        }

        Alerts savedAlert = alertsRepository.save(alerts);
        System.out.println("알림 생성 완료 - ID: " + savedAlert.getId() + ", 타입: " + alertType + ", 시니어: " + vitalSigns.getSenior().getId());

        return new AlertsDto.AlertsCreateDto(
                savedAlert.getAlertType(),
                savedAlert.getTitle(),
                savedAlert.getDescription(),
                savedAlert.getSeniors().getId(),
                savedAlert.getVitalSigns().getId()
        );

    }
    // 보호자 확인용 서비스(미확인) 및 확인 홈화면에서 구현
    // 특정 senior의 모든 알림 조회(페이징)
    public AlertsDto.AlertsPageDto getAlerts(Integer seniorId, Integer guardianId, int page, int size){
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardianId)
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        Pageable pageable = PageRequest.of(page, size);

        Page<Alerts> alertsPage  = alertsRepository.findBySeniorsOrderByCreatedAtDesc(senior, pageable);

        return AlertsDto.AlertsPageDto.from(alertsPage);
    }
    // 특정 senior의 미확인 알림 조회
    public List<AlertsDto.AlertsSearchDto> getFalseAlerts(Integer seniorId, Guardians guardian){
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        List<Alerts> alerts = alertsRepository.findBySeniorsAndIsConfirmedFalseOrderByCreatedAtDesc(senior);

        return alerts.stream()
                .map(AlertsDto.AlertsSearchDto::from)
                .collect(Collectors.toList());
    }
    // 특정 senior의 확인 알림 조회
    public List<AlertsDto.AlertsSearchDto> getTrueAlerts(Integer seniorId, Guardians guardian){
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        List<Alerts> alerts = alertsRepository.findBySeniorsAndIsConfirmedOrderByCreatedAtDesc(senior, true);

        return alerts.stream()
                .map(AlertsDto.AlertsSearchDto::from)
                .collect(Collectors.toList());
    }
    // 모든 알림 조회
    public AlertsDto.AlertsPageDto getAllAlertsByGuardian(Integer guardianId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        Page<Alerts> alertsPage  = alertsRepository.findAllByGuardianId(guardianId, pageable);

        return AlertsDto.AlertsPageDto.from(alertsPage);
    }
    // 모든 미확인 알림 조회
    public List<AlertsDto.AlertsSearchDto> getAllUnconfirmedAlertsByGuardian(Guardians guardians){
        List<Alerts> alerts = alertsRepository.findUnconfirmedAlertsByGuardianId(guardians.getId());

        return alerts.stream()
                .map(AlertsDto.AlertsSearchDto::from)
                .collect(Collectors.toList());
    }

    // 모든 확인 알림 조회
    public List<AlertsDto.AlertsSearchDto> getAllConfirmedAlertsByGuardian(Guardians guardian){
        List<Alerts> alerts = alertsRepository.findConfirmedAlertsByGuardianId(guardian.getId());

        return alerts.stream()
                .map(AlertsDto.AlertsSearchDto::from)
                .collect(Collectors.toList());
    }


    // 삭제 서비스
    public void deleteAlert(Integer alertId, Guardians guardian) {
        Alerts alert = alertsRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("알림을 찾을 수 없습니다."));

        // 보호자 권한 확인
        if (!alert.getSeniors().getGuardian().getId().equals(guardian.getId())) {
            throw new IllegalArgumentException("해당 알림을 삭제할 권한이 없습니다.");
        }

        alertsRepository.delete(alert);
        System.out.println("알림 삭제 완료 - ID: " + alertId + ", 보호자: " + guardian.getId());
    }



    // 제목 자동 생성
    private String generateAutoTitle(VitalSigns vitalSigns, String alertType) {
        String seniorName = vitalSigns.getSenior().getSeniorName();
        String severity = switch (alertType) {
            case "EMERGENCY" -> "응급";
            case "WARNING" -> "주의";
            default -> "알림";
        };
        return String.format("[%s] %s님 생체신호 이상", severity, seniorName);
    }
    // 내용 자동 생성
    private String generateAutoDescription(VitalSigns vitalSigns, String alertType) {
        String abnormalValues = VitalSignsThreshold.getAbnormalValues(vitalSigns);
        String seniorName = vitalSigns.getSenior().getSeniorName();
        String measurementTime = vitalSigns.getMeasurementTime().toString();

        if (abnormalValues.isEmpty()) {
            return String.format("%s님의 생체신호에 이상이 감지되었습니다. (측정시간: %s)", seniorName, measurementTime);
        }

        String action = switch (alertType) {
            case "EMERGENCY" -> "즉시 의료진의 도움을 받으시기 바랍니다.";
            case "WARNING" -> "지속적인 관찰이 필요합니다.";
            default -> "참고해 주시기 바랍니다.";
        };

        return String.format("%s님의 생체신호 이상: %s (측정시간: %s) %s",
                seniorName, abnormalValues, measurementTime, action);
    }

    // 알림 타입 설정 -> VitalSignsThreshold 클래스 제작



    /**
     * 생체신호 측정 시 자동 알림 생성 (정상 범위가 아닌 경우)
     */
    public void checkAndCreateAlert(Integer vitalSignsId) {
        VitalSigns vitalSigns = vitalSignRepository.findById(vitalSignsId)
                .orElseThrow(() -> new EntityNotFoundException("VitalSigns를 찾을 수 없습니다."));

        // 정상 범위가 아닌 경우에만 알림 생성
        if (!vitalSigns.isNormal()) {
            String alertType = VitalSignsThreshold.determineAlertType(vitalSigns);

            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            CustomUserDetails currentUser = (CustomUserDetails) userDetails;

            // INFO 타입이 아닌 경우에만 알림 생성 (WARNING, EMERGENCY만)
            if (!"INFO".equals(alertType)) {
                createDto(vitalSignsId, null, null, currentUser);
            }
        }
    }
}
