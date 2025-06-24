package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;
import java.util.List;

@EnableJpaAuditing
@Entity
@Data
@NoArgsConstructor
@Getter
public class Guardians {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private long id;

    @Column(name = "login_id", nullable = false)
    private String loginId;

    @Column(name = "login_pw", nullable = false)
    private String loginPw;

    @Column(name = "guardian_name", nullable = false)
    private String guardianName;

    @Column
    private String phone;

    @Column
    private String email;

    @Column
    private Boolean isActive; // 계정활성화 상태 확인

    @Column
    private String relationship; // 관계

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @UpdateTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime update_at;

//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private Role role;

    @Builder
    public Guardians(String name, String relationship, Role role) {
        this.guardianName = name;
        this.relationship = relationship;
//        this.role = role;
    }

    @ManyToMany
    private List<Seniors> seniors;
}