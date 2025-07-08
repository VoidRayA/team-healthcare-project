package com.example.backend.controller;

import com.example.backend.dto.HospitalDetailItem;
import com.example.backend.service.ApiService;
import com.example.backend.service.KakaoApiService;
import com.example.backend.service.location.HospitalLocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hospital")
public class HospitalController {
    private final ApiService apiService;
    private final HospitalLocationService hospitalLocationService;
    private final KakaoApiService kakaoApiService;

    public HospitalController(ApiService apiService, HospitalLocationService hospitalLocationService, KakaoApiService kakaoApiService) {
        this.apiService = apiService;
        this.hospitalLocationService = hospitalLocationService;
        this.kakaoApiService = kakaoApiService;
    }

    @GetMapping("/busan")
    public String getBusanHospitals(){
        // 부산광역시 병원 목록 조회 (sidoCd=26)
        return apiService.getBusanHospitals(1, 10); // 첫 번째 페이지, 10개 반환
    }
    
    @GetMapping("/{ykiho}")
    public HospitalDetailItem getHospital(@PathVariable String ykiho){
        return apiService.getHospitalDetail(ykiho);
    }
    
    /**
     * 주소 기반 추천 병원 조회 (2025.07.04 신규 추가)
     * @param address 시니어 주소 (예: "부산광역시 서구 동대신동")
     * @return 추천 병원 정보
     */
    @GetMapping("/recommended")
    public HospitalDetailItem getRecommendedHospital(@RequestParam(required = false) String address) {
        if (address == null || address.trim().isEmpty()) {
            // 주소가 없으면 기본 부산대학교병원 반환
            address = "부산광역시 서구";
        }
        
        return hospitalLocationService.getRecommendedHospital(address);
    }
    
    /**
     * 카카오 API를 사용한 부산 지역 병원 검색 (2025.07.08 신규 추가)
     * @param query 검색어 (기본값: "병원")
     * @param page 페이지 번호 (기본값: 1)
     * @param size 한 페이지 결과 수 (기본값: 15)
     * @param lat 검색 중심 위도 (기본값: 35.1796 - 부산시청)
     * @param lon 검색 중심 경도 (기본값: 129.0756 - 부산시청)
     * @return 카카오 API 기반 병원 정보
     */
    @GetMapping("/kakao/busan")
    public String getBusanHospitalsFromKakao(
            @RequestParam(value = "query", defaultValue = "병원") String query,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "15") int size,
            @RequestParam(value = "lat", defaultValue = "35.1796") double lat,
            @RequestParam(value = "lon", defaultValue = "129.0756") double lon
    ) {
        return kakaoApiService.searchBusanHospitals(query, page, size, lat, lon);
    }
}