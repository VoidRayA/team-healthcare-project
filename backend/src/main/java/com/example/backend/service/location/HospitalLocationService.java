package com.example.backend.service.location;

import com.example.backend.service.KakaoApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 시니어 주소 기반 가까운 병원 추천 서비스
 * 고정값 대신 카카오 API를 활용한 동적 검색
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalLocationService {
    
    private final KakaoApiService kakaoApiService;
    
    /**
     * 시니어 주소 기반 가까운 병원 검색
     * @param seniorAddress 시니어 주소 (예: "부산광역시 서구 동대신동")
     * @return 카카오 API 검색 결과 (JSON 문자열)
     */
    public String searchNearbyHospitals(String seniorAddress) {
        try {
            if (seniorAddress == null || seniorAddress.trim().isEmpty()) {
                log.info("주소가 비어있어 전국 병원 검색을 수행합니다.");
                // 주소가 없으면 전국 범위에서 병원 검색 (서울 중심, 넓은 반경)
                return kakaoApiService.searchHospitalsByLocation("병원", 1, 15, 37.5665, 126.9780, 50000);
            }
            
            log.info("주소 기반 병원 검색: {}", seniorAddress);
            
            // TODO: 실제 주소를 좌표로 변환하는 지오코딩 API 구현
            // 현재는 주소 정보를 바탕으로 대략적인 지역 판단
            double[] coordinates = estimateCoordinatesFromAddress(seniorAddress);
            
            // 추정된 좌표 기반으로 병원 검색 (반경 10km)
            return kakaoApiService.searchHospitalsByLocation("병원", 1, 10, 
                coordinates[0], coordinates[1], 10000);
            
        } catch (Exception e) {
            log.error("병원 검색 중 오류 발생: {}", e.getMessage());
            // 오류 시 전국 범위 검색
            return kakaoApiService.searchHospitalsByLocation("병원", 1, 15, 37.5665, 126.9780, 50000);
        }
    }
    
    /**
     * 주소 문자열에서 대략적인 좌표 추정 (임시 구현)
     * 추후 카카오 지오코딩 API로 교체 예정
     * @param address 주소
     * @return 좌표 배열 [위도, 경도]
     */
    private double[] estimateCoordinatesFromAddress(String address) {
        // 주요 도시별 대략적인 중심 좌표
        if (address.contains("서울")) {
            return new double[]{37.5665, 126.9780}; // 서울시청
        } else if (address.contains("부산")) {
            return new double[]{35.1796, 129.0756}; // 부산시청
        } else if (address.contains("대구")) {
            return new double[]{35.8714, 128.6014}; // 대구시청
        } else if (address.contains("인천")) {
            return new double[]{37.4563, 126.7052}; // 인천시청
        } else if (address.contains("광주")) {
            return new double[]{35.1595, 126.8526}; // 광주시청
        } else if (address.contains("대전")) {
            return new double[]{36.3504, 127.3845}; // 대전시청
        } else if (address.contains("울산")) {
            return new double[]{35.5384, 129.3114}; // 울산시청
        } else if (address.contains("경기")) {
            return new double[]{37.4138, 127.5183}; // 경기도청
        } else if (address.contains("강원")) {
            return new double[]{37.8228, 128.1555}; // 강원도청
        } else if (address.contains("충북") || address.contains("충청북도")) {
            return new double[]{36.6357, 127.4914}; // 충북도청
        } else if (address.contains("충남") || address.contains("충청남도")) {
            return new double[]{36.5184, 126.8000}; // 충남도청
        } else if (address.contains("전북") || address.contains("전라북도")) {
            return new double[]{35.7175, 127.1530}; // 전북도청
        } else if (address.contains("전남") || address.contains("전라남도")) {
            return new double[]{34.8679, 126.9910}; // 전남도청
        } else if (address.contains("경북") || address.contains("경상북도")) {
            return new double[]{36.4919, 128.8889}; // 경북도청
        } else if (address.contains("경남") || address.contains("경상남도")) {
            return new double[]{35.4606, 128.2132}; // 경남도청
        } else if (address.contains("제주")) {
            return new double[]{33.4890, 126.4983}; // 제주도청
        } else {
            // 알 수 없는 지역은 서울 중심으로 설정
            log.warn("알 수 없는 지역입니다. 서울 중심으로 검색합니다: {}", address);
            return new double[]{37.5665, 126.9780};
        }
    }
}
