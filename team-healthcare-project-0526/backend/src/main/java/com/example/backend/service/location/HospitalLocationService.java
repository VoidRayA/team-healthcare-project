package com.example.backend.service.location;

import com.example.backend.dto.HospitalDetailItem;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 시니어 주소 기반 가까운 병원 추천 서비스
 */
@Service
public class HospitalLocationService {
    
    // 부산 구별 대표 병원 매칭 (실제로는 DB나 외부 API에서 관리)
    private static final Map<String, HospitalDetailItem> BUSAN_HOSPITALS = new HashMap<>();
    
    static {
        // 서구 - 부산대학교병원
        HospitalDetailItem pnuh = new HospitalDetailItem();
        pnuh.setYkiho("JDQ4MTk5OSM5MSMkMSMkMCMkOTkjJDIjJDgj");
        pnuh.setYadmNm("부산대학교병원");
        pnuh.setAddr("부산광역시 서구 구덕로 179");
        pnuh.setTelno("051-240-7000");
        pnuh.setHospUrl("http://www.pnuh.co.kr");
        BUSAN_HOSPITALS.put("서구", pnuh);
        
        // 부산진구 - 인제대학교 부산백병원  
        HospitalDetailItem paik = new HospitalDetailItem();
        paik.setYkiho("JDQ4MTk4OSM4MSMkMSMkMCMkOTgjJDIjJDcj");
        paik.setYadmNm("인제대학교 부산백병원");
        paik.setAddr("부산광역시 부산진구 복지로 75");
        paik.setTelno("051-890-6114");
        paik.setHospUrl("http://www.paik.ac.kr/busan");
        BUSAN_HOSPITALS.put("부산진구", paik);
        
        // 남구 - 부산성모병원
        HospitalDetailItem mary = new HospitalDetailItem();
        mary.setYkiho("JDQ4MTk3OSM3MSMkMSMkMCMkOTcjJDIjJDYj");
        mary.setYadmNm("가톨릭대학교 부산성모병원");
        mary.setAddr("부산광역시 남구 용호로 232번길 25-14");
        mary.setTelno("051-933-7114");
        mary.setHospUrl("http://www.bsm.co.kr");
        BUSAN_HOSPITALS.put("남구", mary);
        
        // 기타 구는 부산대학교병원으로 기본 설정
        for (String gu : new String[]{"중구", "동구", "영도구", "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군"}) {
            BUSAN_HOSPITALS.put(gu, pnuh); // 기본값으로 부산대병원
        }
    }
    
    /**
     * 시니어 주소 기반 가까운 병원 추천
     * @param seniorAddress 시니어 주소 (예: "부산광역시 서구 동대신동")
     * @return 추천 병원 정보
     */
    public HospitalDetailItem getRecommendedHospital(String seniorAddress) {
        if (seniorAddress == null || seniorAddress.trim().isEmpty()) {
            return getDefaultHospital();
        }
        
        // 주소에서 구 정보 추출
        String district = extractDistrict(seniorAddress);
        
        // 해당 구의 대표 병원 반환
        return BUSAN_HOSPITALS.getOrDefault(district, getDefaultHospital());
    }
    
    /**
     * 주소 문자열에서 구 정보 추출
     * @param address 주소 (예: "부산광역시 서구 동대신동")
     * @return 구 이름 (예: "서구")
     */
    private String extractDistrict(String address) {
        String[] parts = address.split(" ");
        
        for (String part : parts) {
            if (part.endsWith("구") || part.endsWith("군")) {
                return part;
            }
        }
        
        return "서구"; // 기본값
    }
    
    /**
     * 기본 병원 (부산대학교병원)
     */
    private HospitalDetailItem getDefaultHospital() {
        return BUSAN_HOSPITALS.get("서구");
    }
}
