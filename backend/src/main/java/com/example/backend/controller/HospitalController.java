package com.example.backend.controller;


import com.example.backend.dto.HospitalDetailItem;
import com.example.backend.service.ApiService;
import com.example.backend.service.KakaoApiService;
import com.example.backend.service.TmapApiTester;
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

    private final TmapApiTester tmapApiTester;

    public HospitalController(ApiService apiService, HospitalLocationService hospitalLocationService, KakaoApiService kakaoApiService, TmapApiTester tmapApiTester) {
        this.apiService = apiService;
        this.hospitalLocationService = hospitalLocationService;
        this.kakaoApiService = kakaoApiService;
        this.tmapApiTester = tmapApiTester;
    }

    @GetMapping("/all")
    public String getAllHospitals(@RequestParam(value = "page", defaultValue = "1") int page,
                                  @RequestParam(value = "size", defaultValue = "10") int size,
                                  @RequestParam(value = "sidoCd", required = false) String sidoCd){
        // 전국 병원 목록 조회 (시도 코드 옵션)
        if (sidoCd != null && !sidoCd.trim().isEmpty()) {
            return apiService.getHospitalsBySido(sidoCd, page, size);
        } else {
            return apiService.getAllHospitals(page, size); // 전국 전체
        }
    }
    
    @GetMapping("/{ykiho}")
    public HospitalDetailItem getHospital(@PathVariable String ykiho){
        return apiService.getHospitalDetail(ykiho);
    }
    
    /**
     * 주소 기반 근처 병원 검색 (2025.07.04 신규 추가, 수정됨)
     * @param address 시니어 주소 (예: "부산광역시 서구 동대신동")
     * @return 근처 병원 검색 결과 (JSON)
     */
    @GetMapping("/nearby")
    public String getNearbyHospitals(@RequestParam(required = false) String address) {
        return hospitalLocationService.searchNearbyHospitals(address);
    }
    
    /**
     * 카카오 API를 사용한 위치 기반 병원 검색 (2025.07.17 전국 범위로 확장)
     * @param query 검색어 (기본값: "병원")
     * @param page 페이지 번호 (기본값: 1)
     * @param size 한 페이지 결과 수 (기본값: 15)
     * @param lat 검색 중심 위도 (기본값: 37.5665 - 서울시청)
     * @param lon 검색 중심 경도 (기본값: 126.9780 - 서울시청)
     * @param radius 검색 반경 (m, 기본값: 20000 - 20km)
     * @return 카카오 API 기반 병원 정보
     */
    @GetMapping("/kakao/search")
    public String getHospitalsByLocation(
            @RequestParam(value = "query", defaultValue = "병원") String query,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "15") int size,
            @RequestParam(value = "lat", defaultValue = "37.5665") double lat,
            @RequestParam(value = "lon", defaultValue = "126.9780") double lon,
            @RequestParam(value = "radius", defaultValue = "20000") int radius
    ) {
        return kakaoApiService.searchHospitalsByLocation(query, page, size, lat, lon, radius);
    }
    
    /**
     * T-map API를 사용한 도보 경로 검색 (2025.07.10 신규 추가)
     * @param startLat 출발지 위도
     * @param startLon 출발지 경도
     * @param endLat 도착지 위도
     * @param endLon 도착지 경도
     * @param startName 출발지 이름 (선택사항)
     * @param endName 도착지 이름 (선택사항)
     * @return T-map API 경로 정보
     */
    @GetMapping("/route/tmap")
    public String getTmapWalkingRoute(
            @RequestParam("startLat") double startLat,
            @RequestParam("startLon") double startLon,
            @RequestParam("endLat") double endLat,
            @RequestParam("endLon") double endLon,
            @RequestParam(value = "startName", defaultValue = "현재위치") String startName,
            @RequestParam(value = "endName", defaultValue = "목적지") String endName
    ) {
        return kakaoApiService.getTmapWalkingRoute(startLat, startLon, endLat, endLon, startName, endName);
    }
    
    /**
     * 카카오 Directions API를 사용한 도보 경로 검색 (2025.07.10 신규 추가)
     * @param startLat 출발지 위도
     * @param startLon 출발지 경도
     * @param endLat 도착지 위도
     * @param endLon 도착지 경도
     * @return 카카오 Directions API 경로 정보
     */
    @GetMapping("/route/kakao")
    public String getKakaoWalkingRoute(
            @RequestParam("startLat") double startLat,
            @RequestParam("startLon") double startLon,
            @RequestParam("endLat") double endLat,
            @RequestParam("endLon") double endLon
    ) {
        return kakaoApiService.getKakaoWalkingRoute(startLat, startLon, endLat, endLon);
    }
    
    /**
     * T-map API 종합 테스트 (모든 방법 시도)
     */
    @GetMapping("/test/tmap-all")
    public String testAllTmapMethods() {
        tmapApiTester.testAllTmapMethods();
        return "T-map API 종합 테스트 완료. 콘솔 로그를 확인하세요.";
    }
}