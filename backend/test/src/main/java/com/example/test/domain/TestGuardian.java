package com.example.test.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Getter
public class TestGuardian {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String 관계;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Builder
    public TestGuardian(String name, String 관계) {
        this.name = name;
        this.관계 = 관계;
    }

    public TestGuardian update(String name) {
        this.name = name;
        return this;
    }
}
