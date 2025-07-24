package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.MonitoringSettings;
import com.example.backend.dto.seviceDto.MonitoringSettingsDto;
import com.example.backend.repository.MonitoringSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MonitoringSettingsService {
    
    private final MonitoringSettingsRepository monitoringSettingsRepository;
    
    // 사용자 설정 조회 (없으면 기본값으로 생성)
    public MonitoringSettingsDto.MonitoringSettingsResponseDto getSettings(Guardians guardian) {
        MonitoringSettings settings = monitoringSettingsRepository.findByGuardianId(guardian.getId())
                .orElseGet(() -> createDefaultSettings(guardian));
        
        return MonitoringSettingsDto.MonitoringSettingsResponseDto.from(settings);
    }
    
    // 설정 저장/업데이트
    @Transactional
    public MonitoringSettingsDto.MonitoringSettingsResponseDto saveSettings(
            Guardians guardian, 
            MonitoringSettingsDto.MonitoringSettingsCreateDto createDto) {
        
        MonitoringSettings settings = monitoringSettingsRepository.findByGuardianId(guardian.getId())
                .orElse(MonitoringSettings.builder()
                        .guardian(guardian)
                        .build());
        
        // 값 업데이트
        updateSettingsFromDto(settings, createDto);
        
        MonitoringSettings savedSettings = monitoringSettingsRepository.save(settings);
        return MonitoringSettingsDto.MonitoringSettingsResponseDto.from(savedSettings);
    }
    
    // 설정 부분 업데이트
    @Transactional
    public MonitoringSettingsDto.MonitoringSettingsResponseDto updateSettings(
            Guardians guardian,
            MonitoringSettingsDto.MonitoringSettingsUpdateDto updateDto) {
        
        MonitoringSettings settings = monitoringSettingsRepository.findByGuardianId(guardian.getId())
                .orElseThrow(() -> new RuntimeException("모니터링 설정을 찾을 수 없습니다."));
        
        // null이 아닌 값만 업데이트
        updateSettingsFromUpdateDto(settings, updateDto);
        
        MonitoringSettings savedSettings = monitoringSettingsRepository.save(settings);
        return MonitoringSettingsDto.MonitoringSettingsResponseDto.from(savedSettings);
    }
    
    // 기본 설정 생성
    @Transactional
    public MonitoringSettings createDefaultSettings(Guardians guardian) {
        MonitoringSettings defaultSettings = MonitoringSettings.builder()
                .guardian(guardian)
                .build(); // @Builder.Default 값들이 자동 적용됨
        
        return monitoringSettingsRepository.save(defaultSettings);
    }
    
    // 사용자별 설정 조회 (내부용)
    public MonitoringSettings getSettingsEntity(Guardians guardian) {
        return monitoringSettingsRepository.findByGuardianId(guardian.getId())
                .orElseGet(() -> createDefaultSettings(guardian));
    }
    
    private void updateSettingsFromDto(MonitoringSettings settings, MonitoringSettingsDto.MonitoringSettingsCreateDto dto) {
        if (dto.bloodPressureAttentionMax() != null) {
            settings.setBloodPressureAttentionMax(dto.bloodPressureAttentionMax());
        }
        if (dto.bloodPressureAttentionMin() != null) {
            settings.setBloodPressureAttentionMin(dto.bloodPressureAttentionMin());
        }
        if (dto.bloodPressureCautionMax() != null) {
            settings.setBloodPressureCautionMax(dto.bloodPressureCautionMax());
        }
        if (dto.bloodPressureCautionMin() != null) {
            settings.setBloodPressureCautionMin(dto.bloodPressureCautionMin());
        }
        if (dto.diastolicAttentionMax() != null) {
            settings.setDiastolicAttentionMax(dto.diastolicAttentionMax());
        }
        if (dto.diastolicAttentionMin() != null) {
            settings.setDiastolicAttentionMin(dto.diastolicAttentionMin());
        }
        if (dto.diastolicCautionMax() != null) {
            settings.setDiastolicCautionMax(dto.diastolicCautionMax());
        }
        if (dto.diastolicCautionMin() != null) {
            settings.setDiastolicCautionMin(dto.diastolicCautionMin());
        }
        if (dto.heartRateAttentionMax() != null) {
            settings.setHeartRateAttentionMax(dto.heartRateAttentionMax());
        }
        if (dto.heartRateAttentionMin() != null) {
            settings.setHeartRateAttentionMin(dto.heartRateAttentionMin());
        }
        if (dto.heartRateCautionMax() != null) {
            settings.setHeartRateCautionMax(dto.heartRateCautionMax());
        }
        if (dto.heartRateCautionMin() != null) {
            settings.setHeartRateCautionMin(dto.heartRateCautionMin());
        }
        if (dto.bodyTemperatureAttentionMax() != null) {
            settings.setBodyTemperatureAttentionMax(dto.bodyTemperatureAttentionMax());
        }
        if (dto.bodyTemperatureAttentionMin() != null) {
            settings.setBodyTemperatureAttentionMin(dto.bodyTemperatureAttentionMin());
        }
        if (dto.bodyTemperatureCautionMax() != null) {
            settings.setBodyTemperatureCautionMax(dto.bodyTemperatureCautionMax());
        }
        if (dto.bodyTemperatureCautionMin() != null) {
            settings.setBodyTemperatureCautionMin(dto.bodyTemperatureCautionMin());
        }
        if (dto.bloodSugarAttentionMax() != null) {
            settings.setBloodSugarAttentionMax(dto.bloodSugarAttentionMax());
        }
        if (dto.bloodSugarAttentionMin() != null) {
            settings.setBloodSugarAttentionMin(dto.bloodSugarAttentionMin());
        }
        if (dto.bloodSugarCautionMax() != null) {
            settings.setBloodSugarCautionMax(dto.bloodSugarCautionMax());
        }
        if (dto.bloodSugarCautionMin() != null) {
            settings.setBloodSugarCautionMin(dto.bloodSugarCautionMin());
        }
    }
    
    private void updateSettingsFromUpdateDto(MonitoringSettings settings, MonitoringSettingsDto.MonitoringSettingsUpdateDto dto) {
        if (dto.bloodPressureAttentionMax() != null) {
            settings.setBloodPressureAttentionMax(dto.bloodPressureAttentionMax());
        }
        if (dto.bloodPressureAttentionMin() != null) {
            settings.setBloodPressureAttentionMin(dto.bloodPressureAttentionMin());
        }
        if (dto.bloodPressureCautionMax() != null) {
            settings.setBloodPressureCautionMax(dto.bloodPressureCautionMax());
        }
        if (dto.bloodPressureCautionMin() != null) {
            settings.setBloodPressureCautionMin(dto.bloodPressureCautionMin());
        }
        if (dto.diastolicAttentionMax() != null) {
            settings.setDiastolicAttentionMax(dto.diastolicAttentionMax());
        }
        if (dto.diastolicAttentionMin() != null) {
            settings.setDiastolicAttentionMin(dto.diastolicAttentionMin());
        }
        if (dto.diastolicCautionMax() != null) {
            settings.setDiastolicCautionMax(dto.diastolicCautionMax());
        }
        if (dto.diastolicCautionMin() != null) {
            settings.setDiastolicCautionMin(dto.diastolicCautionMin());
        }
        if (dto.heartRateAttentionMax() != null) {
            settings.setHeartRateAttentionMax(dto.heartRateAttentionMax());
        }
        if (dto.heartRateAttentionMin() != null) {
            settings.setHeartRateAttentionMin(dto.heartRateAttentionMin());
        }
        if (dto.heartRateCautionMax() != null) {
            settings.setHeartRateCautionMax(dto.heartRateCautionMax());
        }
        if (dto.heartRateCautionMin() != null) {
            settings.setHeartRateCautionMin(dto.heartRateCautionMin());
        }
        if (dto.bodyTemperatureAttentionMax() != null) {
            settings.setBodyTemperatureAttentionMax(dto.bodyTemperatureAttentionMax());
        }
        if (dto.bodyTemperatureAttentionMin() != null) {
            settings.setBodyTemperatureAttentionMin(dto.bodyTemperatureAttentionMin());
        }
        if (dto.bodyTemperatureCautionMax() != null) {
            settings.setBodyTemperatureCautionMax(dto.bodyTemperatureCautionMax());
        }
        if (dto.bodyTemperatureCautionMin() != null) {
            settings.setBodyTemperatureCautionMin(dto.bodyTemperatureCautionMin());
        }
        if (dto.bloodSugarAttentionMax() != null) {
            settings.setBloodSugarAttentionMax(dto.bloodSugarAttentionMax());
        }
        if (dto.bloodSugarAttentionMin() != null) {
            settings.setBloodSugarAttentionMin(dto.bloodSugarAttentionMin());
        }
        if (dto.bloodSugarCautionMax() != null) {
            settings.setBloodSugarCautionMax(dto.bloodSugarCautionMax());
        }
        if (dto.bloodSugarCautionMin() != null) {
            settings.setBloodSugarCautionMin(dto.bloodSugarCautionMin());
        }
    }
}