// T-map API 디버깅용 테스트 코드
public class TmapDebugTest {
    
    // 현재 문제점들:
    
    // 1. API 키 확인
    // application.properties의 T-map API 키: 2P5SraBAF69IDMQPgTOQf3K3azhAiJJsZWcYR2T2
    
    // 2. 헤더 문제
    // 기존 코드에서 여러 헤더를 동시에 사용하고 있음:
    // - X-API-Key
    // - Authorization: Bearer
    // - appKey
    
    // 3. T-map API 올바른 헤더 형식
    // T-map API는 단순히 appKey 헤더만 사용해야 함
    
    public String getTmapWalkingRouteFixed(double startLat, double startLon, double endLat, double endLon, String startName, String endName) {
        try {
            // T-map 도보경로 API URL
            String url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";
            
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
            
            // HTTP 요청 생성 - 올바른 헤더 설정
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("appKey", tmapApiKey)  // T-map API는 이 헤더만 필요
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            // API 호출
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                return response.body();
            } else {
                // 403 에러 시 상세 정보 확인
                System.err.println("T-map API 403 에러 상세:");
                System.err.println("URL: " + url);
                System.err.println("API Key: " + tmapApiKey);
                System.err.println("응답: " + response.body());
                return createErrorResponse("T-map API 호출 실패: " + response.statusCode());
            }
            
        } catch (Exception e) {
            return createErrorResponse("T-map API 호출 중 오류 발생: " + e.getMessage());
        }
    }
}

// 해결방안:
// 1. 헤더 단순화: appKey만 사용
// 2. API 키 재발급 확인
// 3. 도메인 등록 확인
// 4. 사용량 한도 확인
