package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monitoring_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private Guardians guardian;
    
    // 혈압 (수축기) 기준치
    @Column(name = "blood_pressure_attention_max")
    @Builder.Default
    private Integer bloodPressureAttentionMax = 180;
    
    @Column(name = "blood_pressure_attention_min")
    @Builder.Default
    private Integer bloodPressureAttentionMin = 90;
    
    @Column(name = "blood_pressure_caution_max")
    @Builder.Default
    private Integer bloodPressureCautionMax = 140;
    
    @Column(name = "blood_pressure_caution_min")
    @Builder.Default
    private Integer bloodPressureCautionMin = 100;
    
    // 혈압 (이완기) 기준치
    @Column(name = "diastolic_attention_max")
    @Builder.Default
    private Integer diastolicAttentionMax = 110;
    
    @Column(name = "diastolic_attention_min")
    @Builder.Default
    private Integer diastolicAttentionMin = 60;
    
    @Column(name = "diastolic_caution_max")
    @Builder.Default
    private Integer diastolicCautionMax = 90;
    
    @Column(name = "diastolic_caution_min")
    @Builder.Default
    private Integer diastolicCautionMin = 65;
    
    // 심박수 기준치
    @Column(name = "heart_rate_attention_max")
    @Builder.Default
    private Integer heartRateAttentionMax = 100;
    
    @Column(name = "heart_rate_attention_min")
    @Builder.Default
    private Integer heartRateAttentionMin = 50;
    
    @Column(name = "heart_rate_caution_max")
    @Builder.Default
    private Integer heartRateCautionMax = 90;
    
    @Column(name = "heart_rate_caution_min")
    @Builder.Default
    private Integer heartRateCautionMin = 60;
    
    // 체온 기준치 (소수점 1자리)
    @Column(name = "body_temperature_attention_max")
    @Builder.Default
    private Double bodyTemperatureAttentionMax = 38.0;
    
    @Column(name = "body_temperature_attention_min")
    @Builder.Default
    private Double bodyTemperatureAttentionMin = 35.5;
    
    @Column(name = "body_temperature_caution_max")
    @Builder.Default
    private Double bodyTemperatureCautionMax = 37.5;
    
    @Column(name = "body_temperature_caution_min")
    @Builder.Default
    private Double bodyTemperatureCautionMin = 36.0;
    
    // 혈당 기준치
    @Column(name = "blood_sugar_attention_max")
    @Builder.Default
    private Integer bloodSugarAttentionMax = 250;
    
    @Column(name = "blood_sugar_attention_min")
    @Builder.Default
    private Integer bloodSugarAttentionMin = 70;
    
    @Column(name = "blood_sugar_caution_max")
    @Builder.Default
    private Integer bloodSugarCautionMax = 180;
    
    @Column(name = "blood_sugar_caution_min")
    @Builder.Default
    private Integer bloodSugarCautionMin = 80;
    
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}