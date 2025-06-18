package com.example.backend.domain.dto;

import lombok.Data;

@Data
public class HospitalDetailItem {
    private String ykiho;
    private String yadmNm;   // 병원명
    private String addr;     // 주소
    private String telno;    // 전화번호
    private String hospUrl;  // 홈페이지
}
