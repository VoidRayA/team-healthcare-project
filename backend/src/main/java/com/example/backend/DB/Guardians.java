package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 보호자 정보를 저장하는 JPA 엔티티
 */
@Entity
@Table(name = "guardians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guardians {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", unique = true, nullable = false, length = 50)
    private String loginId;

    @Column(name = "login_pw", nullable = false)
    private String loginPw;

    @Column(name = "guardian_name", nullable = false, length = 50)  // 테이블 스키마에 맞게 길이 수정
    private String guardianName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)  // unique 제거 (테이블 스키마에 없음)
    private String email;

    @Column(length = 30)  // 테이블 스키마에 맞게 길이 수정
    private String relationship;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "is_active")  // 컬럼명 매핑 추가
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)  // 핵심: created_at으로 매핑
    private LocalDateTime registeredAt;

    @Column(name = "updated_at")  // 컬럼명 매핑 추가
    private LocalDateTime updatedAt;

    /**
     * 엔티티 저장 전 실행되는 메서드
     */
    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    /**
     * 엔티티 업데이트 전 실행되는 메서드
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}