package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.MonitoringSettingsDto;
import com.example.backend.service.MonitoringSettingsService;
import com.example.backend.service.UserSettingService;
import com.example.backend.DB.UserSetting;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/monitoring-settings")
@RequiredArgsConstructor
public class MonitoringSettingsController {
    
    private final MonitoringSettingsService monitoringSettingsService;
    private final UserSettingService userSettingService;
    
    // 사용자 모니터링 설정 조회
    @GetMapping
    public ResponseEntity<MonitoringSettingsDto.MonitoringSettingsResponseDto> getSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        MonitoringSettingsDto.MonitoringSettingsResponseDto settings = 
                monitoringSettingsService.getSettings(userDetails.getGuardian());
        
        return ResponseEntity.ok(settings);
    }
    
    // 모니터링 설정 저장/업데이트
    @PostMapping
    public ResponseEntity<MonitoringSettingsDto.MonitoringSettingsResponseDto> saveSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MonitoringSettingsDto.MonitoringSettingsCreateDto createDto) {
        
        MonitoringSettingsDto.MonitoringSettingsResponseDto savedSettings = 
                monitoringSettingsService.saveSettings(userDetails.getGuardian(), createDto);
        
        return ResponseEntity.ok(savedSettings);
    }
    
    // 모니터링 설정 부분 업데이트
    @PutMapping
    public ResponseEntity<MonitoringSettingsDto.MonitoringSettingsResponseDto> updateSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MonitoringSettingsDto.MonitoringSettingsUpdateDto updateDto) {
        
        MonitoringSettingsDto.MonitoringSettingsResponseDto updatedSettings = 
                monitoringSettingsService.updateSettings(userDetails.getGuardian(), updateDto);
        
        return ResponseEntity.ok(updatedSettings);
    }
    
    // 설정창에서 사용할 간단한 user-settings 엔드포인트
    @PostMapping("/user-settings")
    public ResponseEntity<Map<String, Object>> saveUserSetting(@RequestBody Map<String, Object> request) {
        try {
            Integer guardianId = (Integer) request.get("guardianId");
            String category = (String) request.get("category");
            String subCategory = (String) request.get("subCategory");
            String values = (String) request.get("values");

            // 기존 설정이 있는지 확인
            Optional<UserSetting> existingSetting = userSettingService.findByCategoryAndSubCategory(guardianId, category, subCategory);

            UserSetting userSetting;
            if (existingSetting.isPresent()) {
                // 업데이트
                userSetting = existingSetting.get();
                userSetting.setValues(values);
                userSetting.setUpdatedAt(LocalDateTime.now());
            } else {
                // 새로 생성
                userSetting = new UserSetting();
                userSetting.setGuardianId(guardianId.longValue());
                userSetting.setCategory(category);
                userSetting.setSubCategory(subCategory);
                userSetting.setValues(values);
                userSetting.setCreatedAt(LocalDateTime.now());
                userSetting.setUpdatedAt(LocalDateTime.now());
            }

            // 저장
            UserSetting savedSetting = userSettingService.saveSetting(userSetting);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedSetting);
            response.put("message", "설정이 성공적으로 저장되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "설정 저장 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}