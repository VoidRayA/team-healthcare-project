package com.example.backend.controller;

import com.example.backend.DB.UserSetting;
import com.example.backend.service.UserSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-settings")
@CrossOrigin(origins = "*")
public class UserSettingController {

    @Autowired
    private UserSettingService userSettingService;

    /**
     * 드롭다운 항목 조회 (ID 포함)
     */
    @GetMapping("/vital-dropdown-with-id")
    public ResponseEntity<Map<String, Object>> getDropdownItemsWithId(@RequestParam Integer guardianId) {
        try {
            List<Map<String, Object>> items = userSettingService.getDropdownItemsWithId(guardianId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "드롭다운 항목 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 드롭다운 항목 삭제
     */
    @DeleteMapping("/vital-item/{itemId}")
    public ResponseEntity<Map<String, Object>> deleteDropdownItem(@PathVariable Long itemId) {
        try {
            boolean deleted = userSettingService.deleteDropdownItem(itemId);
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("success", true);
                response.put("message", "항목이 성공적으로 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "삭제할 항목을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "항목 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 드롭다운 항목 조회
     */
    @GetMapping("/vital-dropdown-items")
    public ResponseEntity<Map<String, Object>> getDropdownItems(@RequestParam Integer guardianId) {
        try {
            List<String> items = userSettingService.getDropdownItems(guardianId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "드롭다운 항목 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 드롭다운 항목 추가
     */
    @PostMapping("/vital-item")
    public ResponseEntity<Map<String, Object>> addDropdownItem(@RequestBody Map<String, Object> request) {
        try {
            Integer guardianId = (Integer) request.get("guardianId");
            String category = (String) request.get("category");
            String itemValue = (String) request.get("itemValue");

            UserSetting userSetting = userSettingService.saveOrUpdateDropdownItem(guardianId, category, itemValue);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userSetting);
            response.put("message", "항목이 성공적으로 추가되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "항목 추가 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 바이탈 사인 설정 조회
     */
    @GetMapping("/vital-config")
    public ResponseEntity<Map<String, Object>> getVitalConfig(@RequestParam Integer guardianId) {
        try {
            List<UserSetting> settings = userSettingService.getAllSettings(guardianId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", settings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "바이탈 사인 설정 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 사용자 설정 조회 (필터링 가능)
     */
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getUserSettings(
            @RequestParam Integer guardianId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subCategory) {
        try {
            List<UserSetting> settings;
            if (category != null && subCategory != null) {
                // 특정 카테고리와 서브카테고리로 필터링
                settings = userSettingService.getAllSettings(guardianId).stream()
                    .filter(s -> category.equals(s.getCategory()) && subCategory.equals(s.getSubCategory()))
                    .toList();
            } else if (category != null) {
                // 특정 카테고리로 필터링
                settings = userSettingService.getAllSettings(guardianId).stream()
                    .filter(s -> category.equals(s.getCategory()))
                    .toList();
            } else {
                // 모든 설정 조회
                settings = userSettingService.getAllSettings(guardianId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", settings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "사용자 설정 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 사용자 설정 저장/업데이트
     */
    @PostMapping("")
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 드롭다운 설정 조회
     */
    @GetMapping("/vital-dropdown")
    public ResponseEntity<Map<String, Object>> getDropdownSettings(@RequestParam Integer guardianId) {
        try {
            List<String> items = userSettingService.getDropdownItems(guardianId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "드롭다운 설정 조회 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
