package com.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KakaoApiService {
    
    @Value("${kakao.rest-api-key}")
    private String restApiKey;
    
    @Value("${tmap.api-key:}")
    private String tmapApiKey;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * T-map 도보 경로 검색 API
     */
    public String getTmapWalkingRoute(double startLat, double startLon, double endLat, double endLon, String startName, String endName) {
        try {
            // T-map API 키 확인
            if (tmapApiKey == null || tmapApiKey.trim().isEmpty()) {
                System.out.println("T-map API 키가 설정되지 않음");
                return createErrorResponse("T-map API 키가 설정되지 않았습니다.");
            }
            
            System.out.println("=== T-map API 호출 상세 정보 ===");
            System.out.println("API Key: " + tmapApiKey);
            System.out.println("출발지: " + startLat + ", " + startLon);
            System.out.println("도착지: " + endLat + ", " + endLon);
            
            // T-map 도보경로 API URL - 다양한 버전 시도
            String[] urls = {
                "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1",
                "https://apis.sk.com/tmap/routes/pedestrian?version=1",
                "https://openapi.sk.com/tmap/routes/pedestrian?version=1",
                "https://apis.openapi.sk.com/tmap/routes/pedestrian"
            };
            
            HttpResponse<String> response = null;
            String successUrl = null;
            
            for (String url : urls) {
                System.out.println("시도하는 URL: " + url);
            
            // 요청 데이터 생성
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("startX", String.valueOf(startLon));
            requestBody.put("startY", String.valueOf(startLat));
            requestBody.put("endX", String.valueOf(endLon));
            requestBody.put("endY", String.valueOf(endLat));
            requestBody.put("reqCoordType", "WGS84GEO");
            requestBody.put("resCoordType", "WGS84GEO");
            requestBody.put("startName", startName != null ? startName : "현재위치");
            requestBody.put("endName", endName != null ? endName : "목적지");
            
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            System.out.println("요청 본문: " + jsonBody);
            
                // HTTP 요청 생성
                HttpClient client = HttpClient.newHttpClient();
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json; charset=utf-8")
                        .header("appKey", tmapApiKey)
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .header("Referer", "https://openapi.sk.com")
                        .header("Origin", "https://openapi.sk.com")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                        .build();
                
                response = client.send(request, HttpResponse.BodyHandlers.ofString());
                
                System.out.println("URL: " + url + " - 상태 코드: " + response.statusCode());
                
                if (response.statusCode() == 200) {
                    successUrl = url;
                    System.out.println("✅ 성공! URL: " + url);
                    break;
                } else if (response.statusCode() != 403 && response.statusCode() != 401) {
                    // 403, 401이 아닌 다른 오류는 중단
                    System.err.println("비403/401 오류 발생: " + response.statusCode());
                    break;
                }
            }
            
            System.out.println("=== T-map API 응답 상세 ===");
            System.out.println("상태 코드: " + response.statusCode());
            System.out.println("응답 헤더: " + response.headers().map());
            System.out.println("응답 본문 전체: " + response.body());
            System.out.println("응답 본문 크기: " + response.body().length() + " bytes");
            
            if (response.statusCode() == 200) {
                System.out.println("✅ T-map API 성공! 응답 전달");
                System.out.println("응답 데이터 크기: " + response.body().length() + " bytes");
                System.out.println("응답 시작 100자: " + (response.body().length() > 100 ? response.body().substring(0, 100) + "..." : response.body()));
                
                // 성공 응답을 그대로 프론트엔드에 전달
                return response.body();
            } else {
                System.err.println("=== T-map API 오류 상세 분석 ===");
                System.err.println("상태 코드: " + response.statusCode());
                System.err.println("응답 본문: " + response.body());
                
                if (response.statusCode() == 401) {
                    System.err.println("401 Unauthorized 오류 해결 방법:");
                    System.err.println("1. SK Open API 콘솔에서 도메인 등록: localhost:8080, 127.0.0.1:8080");
                    System.err.println("2. T-map API 사용 권한 확인 (프로젝트 상태: 활성화)");
                    System.err.println("3. API 키 재발급 고려");
                    
                    return createErrorResponse("T-map API 인증 오류 (401): SK OpenAPI 콘솔에서 도메인 등록 필요");
                }
                if (response.statusCode() == 403) {
                    System.err.println("403 Forbidden 오류 원인 분석:");
                    System.err.println("1. API 키 확인: " + tmapApiKey);
                    System.err.println("2. 도메인 등록 확인 필요 (SK OpenAPI 콘솔)");
                    System.err.println("3. 사용량 한도 확인 필요");
                    System.err.println("4. IP 제한 확인 필요");
                    
                    // T-map API 필수 사용이므로 에러 반환
                    return createErrorResponse("T-map API 인증 오류 (403): SK OpenAPI 콘솔에서 도메인 등록 및 API 키 확인 필요");
                }
                
                return createErrorResponse("T-map API 호출 실패: " + response.statusCode() + " - " + response.body());
            }
            
        } catch (Exception e) {
            System.err.println("T-map API 호출 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            
            // T-map API 필수 사용이므로 에러 반환
            return createErrorResponse("T-map API 호출 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 카카오 API 대체 경로 검색 (Directions API가 404이므로 대체)
     */
    public String getKakaoWalkingRoute(double startLat, double startLon, double endLat, double endLon) {
        try {
            // API 키 확인
            if (restApiKey == null || restApiKey.equals("YOUR_KAKAO_REST_API_KEY")) {
                System.out.println("카카오 API 키가 설정되지 않음");
                return createErrorResponse("카카오 API 키가 설정되지 않았습니다.");
            }
            
            System.out.println("=== 카카오 API 대체 경로 검색 ===");
            System.out.println("출발지: " + startLat + ", " + startLon);
            System.out.println("도착지: " + endLat + ", " + endLon);
            
            // 직선 거리 계산
            double distance = calculateDistance(startLat, startLon, endLat, endLon);
            double walkingDistance = distance * 1.3; // 도로 경로 보정
            int walkingTime = (int) Math.ceil(walkingDistance / 83); // 5km/h 도보 속도 (83m/min)
            
            System.out.println("직선 거리: " + distance + "m");
            System.out.println("예상 도보 거리: " + walkingDistance + "m");
            System.out.println("예상 도보 시간: " + walkingTime + "분");
            
            // 간단한 경로 데이터 생성 (GeoJSON 형식 모방)
            Map<String, Object> mockRoute = new HashMap<>();
            List<Map<String, Object>> routes = new ArrayList<>();
            Map<String, Object> route = new HashMap<>();
            Map<String, Object> summary = new HashMap<>();
            
            summary.put("distance", (int) walkingDistance);
            summary.put("duration", walkingTime * 60); // 초 단위
            
            // 섬 데이터 생성
            List<Map<String, Object>> sections = new ArrayList<>();
            Map<String, Object> section = new HashMap<>();
            List<Map<String, Object>> roads = new ArrayList<>();
            Map<String, Object> road = new HashMap<>();
            
            // 직선 경로 좌표
            List<Double> vertexes = new ArrayList<>();
            vertexes.add(startLon);
            vertexes.add(startLat);
            vertexes.add(endLon);
            vertexes.add(endLat);
            
            road.put("vertexes", vertexes);
            roads.add(road);
            section.put("roads", roads);
            sections.add(section);
            
            route.put("summary", summary);
            route.put("sections", sections);
            routes.add(route);
            mockRoute.put("routes", routes);
            
            String result = objectMapper.writeValueAsString(mockRoute);
            System.out.println("카카오 대체 API 응답: " + result);
            
            return result;
            
        } catch (Exception e) {
            System.err.println("카카오 대체 API 호출 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse("카카오 대체 API 호출 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * 두 지점 간 거리 계산 (단위: 미터)
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371e3; // 지구 반지름 (미터)
        double φ1 = Math.toRadians(lat1);
        double φ2 = Math.toRadians(lat2);
        double Δφ = Math.toRadians(lat2 - lat1);
        double Δλ = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    /**
     * 부산 지역 병원 검색
     * @param query 검색어 (기본값: "병원")
     * @param page 페이지 번호 (1~45)
     * @param size 한 페이지 결과 수 (1~15)
     * @return 병원 정보 JSON
     */
    /**
     * 부산 지역 병원 검색
     * @param query 검색어 (기본값: "병원")
     * @param page 페이지 번호 (1~45)
     * @param size 한 페이지 결과 수 (1~15)
     * @param centerLat 검색 중심 위도
     * @param centerLon 검색 중심 경도
     * @return 병원 정보 JSON
     */
    public String searchBusanHospitals(String query, int page, int size, double centerLat, double centerLon) {
        try {
            // API 키 확인
            if (restApiKey == null || restApiKey.equals("YOUR_KAKAO_REST_API_KEY")) {
                System.out.println("Kakao API 키가 설정되지 않아 대체 데이터 사용");
                return createMockKakaoResponse();
            }
            // 기본 검색어 설정
            if (query == null || query.trim().isEmpty()) {
                query = "병원";
            }
            
            // Kakao 지역검색 API URL
            String encodedQuery = URLEncoder.encode(query + " 부산", StandardCharsets.UTF_8);
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json"
                    + "?query=" + encodedQuery
                    // + "&category_group_code=HP8" // 병원 카테고리 제거
                    + "&x=" + centerLon // 사용자 지정 경도
                    + "&y=" + centerLat  // 사용자 지정 위도
                    + "&radius=20000" // 20km 반경
                    + "&page=" + page
                    + "&size=" + size
                    + "&sort=distance"; // 거리순 정렬
            
            System.out.println("Kakao API 호출 URL: " + url);
            
            // HTTP 요청 생성
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "KakaoAK " + restApiKey)
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();
            
            // API 호출
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("Kakao API 응답 상태: " + response.statusCode());
            System.out.println("Kakao API 응답 내용: " + response.body());
            
            if (response.statusCode() == 200) {
                // Kakao API 응답을 공공데이터 API 형식으로 변환
                return convertKakaoToPublicApiFormat(response.body());
            } else {
                System.err.println("Kakao API 오류: " + response.statusCode() + " - " + response.body());
                return createErrorResponse("Kakao API 호출 실패: " + response.statusCode());
            }
            
        } catch (Exception e) {
            System.err.println("Kakao API 호출 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse("API 호출 중 오류 발생: " + e.getMessage());
        }
    }
    
    /**
     * Kakao API 응답을 기존 공공데이터 API 형식으로 변환
     */
    private String convertKakaoToPublicApiFormat(String kakaoResponse) {
        try {
            JsonNode kakaoJson = objectMapper.readTree(kakaoResponse);
            JsonNode documents = kakaoJson.path("documents");
            JsonNode meta = kakaoJson.path("meta");
            
            List<Map<String, String>> hospitals = new ArrayList<>();
            
            // Kakao API 결과를 공공데이터 형식으로 변환
            for (JsonNode doc : documents) {
                Map<String, String> hospital = new HashMap<>();
                hospital.put("yadmNm", doc.path("place_name").asText()); // 병원명
                hospital.put("telno", doc.path("phone").asText().isEmpty() ? "전화번호 정보 없음" : doc.path("phone").asText()); // 전화번호
                hospital.put("addr", doc.path("road_address_name").asText().isEmpty() ? 
                           doc.path("address_name").asText() : doc.path("road_address_name").asText()); // 주소
                
                // 추가 정보
                hospital.put("categoryName", doc.path("category_name").asText()); // 카테고리
                hospital.put("distance", doc.path("distance").asText()); // 거리
                hospital.put("placeUrl", doc.path("place_url").asText()); // 상세 URL
                
                hospitals.add(hospital);
            }
            
            // 공공데이터 API 형식으로 JSON 생성
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> responseWrapper = new HashMap<>();
            Map<String, Object> header = new HashMap<>();
            Map<String, Object> body = new HashMap<>();
            Map<String, Object> items = new HashMap<>();
            
            header.put("resultCode", "00");
            header.put("resultMsg", "NORMAL SERVICE.");
            
            items.put("item", hospitals);
            body.put("items", items);
            body.put("numOfRows", hospitals.size());
            body.put("pageNo", 1);
            body.put("totalCount", meta.path("total_count").asInt());
            
            responseWrapper.put("header", header);
            responseWrapper.put("body", body);
            response.put("response", responseWrapper);
            
            return objectMapper.writeValueAsString(response);
            
        } catch (Exception e) {
            System.err.println("Kakao API 응답 변환 중 오류: " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse("응답 변환 중 오류 발생");
        }
    }
    
    /**
     * Kakao API 키 없을 때 사용할 Mock 데이터
     */
    private String createMockKakaoResponse() {
        return "{"
                + "\"response\": {"
                + "\"header\": {\"resultCode\": \"00\", \"resultMsg\": \"NORMAL SERVICE.\"},"
                + "\"body\": {"
                + "\"items\": {"
                + "\"item\": ["
                + "{\"yadmNm\": \"부산대학교병원\", \"telno\": \"051-240-7000\", \"addr\": \"부산광역시 서구 구덕로 179\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"1200\"},"
                + "{\"yadmNm\": \"인제대학교 부산백병원\", \"telno\": \"051-890-6114\", \"addr\": \"부산광역시 부산진구 복지로 75\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"2300\"},"
                + "{\"yadmNm\": \"가톨릭대학교 부산성모병원\", \"telno\": \"051-933-7114\", \"addr\": \"부산광역시 남구 용호로 232번길 25-14\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"3500\"},"
                + "{\"yadmNm\": \"동아대학교병원\", \"telno\": \"051-554-0114\", \"addr\": \"부산광역시 서구 대신공원로 26\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"1800\"},"
                + "{\"yadmNm\": \"부산의료원\", \"telno\": \"051-607-2000\", \"addr\": \"부산광역시 연제구 반송로 75\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"4200\"},"
                + "{\"yadmNm\": \"해운대백병원\", \"telno\": \"051-797-0100\", \"addr\": \"부산광역시 해운대구 해운대로 875\", \"categoryName\": \"의료,건강 > 종합병원\", \"distance\": \"6800\"}"
                + "],"
                + "\"numOfRows\": 6,"
                + "\"pageNo\": 1,"
                + "\"totalCount\": 6"
                + "}"
                + "}"
                + "}";
    }
    private String createErrorResponse(String errorMessage) {
        return "{"
                + "\"response\": {"
                + "\"header\": {\"resultCode\": \"99\", \"resultMsg\": \"" + errorMessage + "\"},"
                + "\"body\": {"
                + "\"items\": {\"item\": []},"
                + "\"numOfRows\": 0,"
                + "\"pageNo\": 1,"
                + "\"totalCount\": 0"
                + "}"
                + "}"
                + "}";
    }
}