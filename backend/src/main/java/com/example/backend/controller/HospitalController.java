package com.example.backend.controller;

import com.example.backend.dto.HospitalDetailItem;
import com.example.backend.service.ApiService;
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

    public HospitalController(ApiService apiService, HospitalLocationService hospitalLocationService) {
        this.apiService = apiService;
        this.hospitalLocationService = hospitalLocationService;
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
}