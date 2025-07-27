package com.example.backend.DB;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/*
* 알림 관리 테이블
* */
@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
//    @JoinColumn(name = "guardian_id")
    @JoinColumn(name = "confirmed_by")
    private Guardians confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // guardian_id를 seniors를 통해 가져올 수 있도록 getter 추가
    @Transient
    public Integer getGuardianId() {
        return seniors != null && seniors.getGuardian() != null ? seniors.getGuardian().getId() : null;
    }
}
