package com.example.backend.domain.DB;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Getter
public class Guardian extends User {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String 관계;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Builder
    public Guardian(String name, String 관계) {
        this.name = name;
        this.관계 = 관계;
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
