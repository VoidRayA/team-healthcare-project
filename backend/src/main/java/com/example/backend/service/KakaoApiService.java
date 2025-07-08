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
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
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