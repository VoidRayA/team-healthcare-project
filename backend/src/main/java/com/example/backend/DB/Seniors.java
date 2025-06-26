package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "seniors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Seniors {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // DB가 INT이므로 Integer 사용

    // Guardian과의 관계 - ManyToOne
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private Guardians guardian;

    @Column(name = "senior_name", nullable = false, length = 30)
    private String seniorName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate; // birth_date -> birthDate (camelCase)

    @Column(length = 1)
    private Character gender; // CHAR(1) -> Character

    @Column(length = 255)
    private String address;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact; // emergency_contact -> emergencyContact

    @Column(name = "chronic_diseases", columnDefinition = "TEXT")
    private String chronicDiseases; // chronic_diseases -> chronicDiseases

    @Column(columnDefinition = "TEXT")
    private String medications;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // 새로 추가된 컬럼
    @Column(length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}