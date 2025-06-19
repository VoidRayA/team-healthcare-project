package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDateTime;
import java.util.List;

@EnableJpaAuditing
@Entity
@Data
@NoArgsConstructor
@Getter
public class Guardian {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String guardianEmail;

    @Column(nullable = false)
    private String relationship; // 관계

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder
    public Guardian(String name, String guardianEmail, String relationship, Role role) {
        this.name = name;
        this.guardianEmail = guardianEmail;
        this.relationship = relationship;
        this.role = role;
    }

    @ManyToMany
    @JoinTable(name = "guardian_senior")
    private List<Senior> seniors;

    @ManyToOne
    private Senior mainSenior;

    public Guardian update(String name) {
        this.name = name;
        return this;
    }
}
