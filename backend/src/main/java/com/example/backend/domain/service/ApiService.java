package com.example.backend.domain.service;

import com.example.backend.domain.dto.HospitalDetailItem;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class ApiService {
    @Value("${openapi.service-key}")
    private String serviceKey;

    public HospitalDetailItem getHospitalDetail(String ykiho) {
        try {
            String url = "https://apis.data.go.kr/B551182/MadmDtlInfoService2.7/getDtlInfo2.7"
                    + "?serviceKey=" + serviceKey
                    + "&ykiho=" + ykiho
                    + "&_type=json";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.body());

            JsonNode item = root.path("response").path("body").path("items").path("item");

            HospitalDetailItem detail = new HospitalDetailItem();
            detail.setYkiho(item.path("ykiho").asText());
            detail.setYadmNm(item.path("yadmNm").asText());
            detail.setAddr(item.path("addr").asText());
            detail.setTelno(item.path("telno").asText());
            detail.setHospUrl(item.path("hospUrl").asText());

            return detail;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public String getDtlInfo(String ykiho, int pageNo, int numOfRows) {
        String url = "https://apis.data.go.kr/B551182/MadmDtlInfoService2.7"
                + "?serviceKey=" + serviceKey
                + "&ykiho=" + ykiho
                + "&numOfRows=" + numOfRows
                + "&pageNo=" + pageNo
                + "&_type=json";

        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            return response.body();

        } catch (Exception e) {
            System.err.println("의료기관별상세정보서비스 호출 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return "{\"error\": \"API 호출 실패\", \"message\": \"" + e.getMessage() + "\"}";
        }
    }
}
