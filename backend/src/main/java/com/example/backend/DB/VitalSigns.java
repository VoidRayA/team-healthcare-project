package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/*
    생체신호 기록 테이블
*/
@Entity
@Table(name = "vital_signs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalSigns {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "senior_id")
    private Seniors senior;

    @Column(name = "measurement_time")
    private LocalDateTime measurementTime;  // 측정시간

    @Column(name = "blood_pressure_high")
    private int bloodPressureHigh;          // 수축기 혈압

    @Column(name = "blood_pressure_low")
    private int blood_pressure_low;         // 이완기 혈압

    @Column(name = "heart_rate")
    private int heart_rate;                 // 심박수

    @Column(name = "blood_sugar")
    private int blood_sugar;                // 혈당

    @Column(name = "body_temperature", precision = 4, scale = 2)
    private BigDecimal bodyTemperature;     // 체온

    @Column(name = "is_normal")
    private boolean isNormal;               // 정상 범위 여부

    private String notes;                   // 특이사항

    @CreationTimestamp  // 엔티티가 처음 저장될 때 자동으로 현재시간 설정
    @Column(name = "created_at")
    private LocalDateTime createdAt;        // 기록 시간

}
