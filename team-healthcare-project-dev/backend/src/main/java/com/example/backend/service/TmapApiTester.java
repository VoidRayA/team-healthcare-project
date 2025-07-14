package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class TmapApiTester {
    
    @Value("${tmap.api-key:}")
    private String tmapApiKey;
    
    public void testAllTmapMethods() {
        String[] urls = {
            "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1",
            "https://apis.sk.com/tmap/routes/pedestrian?version=1", 
            "https://openapi.sk.com/tmap/routes/pedestrian?version=1",
            "https://apis.openapi.sk.com/tmap/routes/pedestrian"
        };
        
        String[][] headers = {
            {"appKey", tmapApiKey},
            {"X-API-Key", tmapApiKey},
            {"Authorization", "Bearer " + tmapApiKey},
            {"api-key", tmapApiKey},
            {"apikey", tmapApiKey}
        };
        
        String jsonBody = "{\"startX\":\"129.0756\",\"startY\":\"35.1796\",\"endX\":\"129.0757\",\"endY\":\"35.1797\",\"reqCoordType\":\"WGS84GEO\",\"resCoordType\":\"WGS84GEO\",\"startName\":\"테스트출발\",\"endName\":\"테스트도착\"}";
        
        for (String url : urls) {
            for (String[] header : headers) {
                try {
                    HttpClient client = HttpClient.newHttpClient();
                    
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .header("Content-Type", "application/json; charset=utf-8")
                            .header(header[0], header[1])
                            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                            .header("Referer", "https://openapi.sk.com")
                            .header("Origin", "https://openapi.sk.com")
                            .header("Accept", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                            .build();
                    
                    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                    
                    System.out.println("=== 테스트 결과 ===");
                    System.out.println("URL: " + url);
                    System.out.println("헤더: " + header[0] + " = " + header[1].substring(0, Math.min(10, header[1].length())) + "...");
                    System.out.println("상태 코드: " + response.statusCode());
                    
                    if (response.statusCode() == 200) {
                        System.out.println("🎉 성공!");
                        System.out.println("응답: " + response.body());
                        return; // 성공하면 중단
                    } else {
                        System.out.println("실패: " + response.body());
                    }
                    
                } catch (Exception e) {
                    System.err.println("예외 발생: " + e.getMessage());
                }
                
                System.out.println("---");
            }
        }
        
        System.out.println("❌ 모든 방법 실패");
    }
}
