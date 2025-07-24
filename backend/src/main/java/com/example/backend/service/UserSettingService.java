package com.example.backend.service;

import com.example.backend.DB.UserSetting;
import com.example.backend.repository.UserSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserSettingService {

    @Autowired
    private UserSettingRepository userSettingRepository;

    /**
     * 드롭다운 항목 조회 (ID 포함)
     * 프론트엔드에서 삭제를 위해 ID 정보가 필요할 때 사용
     */
    public List<Map<String, Object>> getDropdownItemsWithId(Integer guardianId) {
        List<UserSetting> settings = userSettingRepository.findByCategoryAndSubCategoryAndGuardianId(
            "일정관리", "dropdown", guardianId.longValue()
        );
        
        return settings.stream()
            .map(setting -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", setting.getId());
                item.put("value", setting.getValues());
                return item;
            })
            .collect(Collectors.toList());
    }

    /**
     * 드롭다운 항목 조회 (일정관리 카테고리))
     * DB 구조: 각 드롭다운 항목이 별도 레코드로 저장됨
     * - category = "일정관리"
     * - sub_category = "dropdown"
     * - values = "식사횟수", "운동시간", "복약여부" 등 (각각 별도 레코드)
     */
    public List<String> getDropdownItems(Integer guardianId) {
        // 일정관리 카테고리의 dropdown 항목들 조회
        List<UserSetting> settings = userSettingRepository.findByCategoryAndSubCategoryAndGuardianId(
            "일정관리", "dropdown", guardianId.longValue()
        );
        
        // values 필드만 추출하여 반환
        return settings.stream()
            .map(UserSetting::getValues)
            .collect(Collectors.toList());
    }

    /**
     * 특정 카테고리의 드롭다운 항목 조회
     */
    public List<String> getDropdownItemsByCategory(String category, Integer guardianId) {
        List<UserSetting> settings = userSettingRepository.findByCategoryAndSubCategoryAndGuardianId(
            category, "dropdown", guardianId.longValue()
        );
        
        return settings.stream()
            .map(UserSetting::getValues)
            .collect(Collectors.toList());
    }

    /**
     * 드롭다운 항목 저장/수정
     */
    public UserSetting saveOrUpdateDropdownItem(Integer guardianId, String category, String itemValue) {
        UserSetting userSetting = new UserSetting();
        userSetting.setGuardianId(guardianId.longValue());
        userSetting.setCategory(category);
        userSetting.setSubCategory("dropdown");
        userSetting.setValues(itemValue);
        userSetting.setCreatedAt(LocalDateTime.now());
        userSetting.setUpdatedAt(LocalDateTime.now());
        
        return userSettingRepository.save(userSetting);
    }

    /**
     * 드롭다운 항목 삭제
     */
    public boolean deleteDropdownItem(Long id) {
        Optional<UserSetting> existingItem = userSettingRepository.findById(id);
        if (existingItem.isPresent()) {
            userSettingRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * 특정 값으로 항목 조회
     */
    public Optional<UserSetting> findByValueAndGuardianId(String value, Integer guardianId) {
        return userSettingRepository.findByCategoryAndSubCategoryAndGuardianIdAndValues(
            "일정관리", "dropdown", guardianId.longValue(), value
        );
    }

    /**
     * 모든 설정 조회 (디버깅용)
     */
    public List<UserSetting> getAllSettings(Integer guardianId) {
        return userSettingRepository.findByGuardianIdOrderByCategoryAscSubCategoryAsc(guardianId.longValue());
    }
    
    /**
     * 설정 저장/업데이트
     */
    public UserSetting saveSetting(UserSetting userSetting) {
        return userSettingRepository.save(userSetting);
    }
    
    /**
     * 특정 카테고리와 서브카테고리로 설정 조회
     */
    public Optional<UserSetting> findByCategoryAndSubCategory(Integer guardianId, String category, String subCategory) {
        List<UserSetting> settings = userSettingRepository.findByCategoryAndSubCategoryAndGuardianId(
            category, subCategory, guardianId.longValue()
        );
        return settings.isEmpty() ? Optional.empty() : Optional.of(settings.get(0));
    }
}