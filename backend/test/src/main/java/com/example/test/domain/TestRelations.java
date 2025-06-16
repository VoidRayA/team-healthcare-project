package com.example.test.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
public class TestRelations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private boolean is_primary;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @ManyToOne
    @JoinColumn(name = "guardian_id", nullable = false)
    private TestGuardian guardian;

    @ManyToOne
    @JoinColumn(name = "senior_id", nullable = false)
    private TestSenior senior;
}
