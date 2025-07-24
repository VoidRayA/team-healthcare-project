package com.example.backend.controller;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.MonitoringSettingsDto;
import com.example.backend.service.MonitoringSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/monitoring-settings")
@RequiredArgsConstructor
public class MonitoringSettingsController {
    
    private final MonitoringSettingsService monitoringSettingsService;
    
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
}