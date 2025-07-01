package com.example.backend.DB;


import jakarta.persistence.*;

import java.time.LocalDateTime;

/*
* 알림 관리 테이블
*
* seniors 테이블 참조
* 알림 타입 emergency/warning/info
* 알림 제목
* 알림 내용
* 생체 신호 테이블 참조
* 확인여부
* 확인한 보호자
* 확인 시간
* 알림 생성 시각
* */
@Entity
@Table(name = "alerts")
public class Alerts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senior_id")
    private Seniors seniors;

    @Column(name = "alert_type")
    private String alertType;

    private String title;

    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_vital_id")
    private VitalSigns vitalSigns;

    @Column(name = "is_confirmed")
    private boolean isConfirmed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id")
    private Guardians confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
