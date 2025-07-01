package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    private Integer id;

    @Column(name = "login_id", unique = true, nullable = false, length = 50)
    private String loginId;

    @Column(name = "login_pw", nullable = false)
    private String loginPw;

    @Column(name = "guardian_name", nullable = false, length = 50)
    private String guardianName;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String relationship;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // senior 과의 관계 설정
    @OneToMany(mappedBy = "guardian", cascade = CascadeType.ALL)
    private List<GuardianSenior> guardianSeniors = new ArrayList<>();

    // getSeniors() 도우미 메서드
    public List<Seniors> getSeniors() {
        return guardianSeniors.stream()
                .map(GuardianSenior::getSenior)
                .collect(Collectors.toList());
    }

    /**
     * 엔티티 저장 전 실행되는 메서드들은 아래에 작성
     */
    //========================== 엔티티 저장 전 ==========================
    // isActive == null -> 신규일 경우에만 해당
    // 즉 신규로 계정을 생성했을 경우 사용여부는 True로 설정
    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    /**
     * 엔티티 업데이트 전 실행되는 메서드들은 아래에 작성
     */
    //========================== 엔티티 업데이트 전 ==========================
    // 생성일자 Update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}