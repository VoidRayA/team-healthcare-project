package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@EnableJpaAuditing
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Senior {
    @Id
    private long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Guardian guardian;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Column(nullable = false)
    private char gender;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String emergency_contact;

    @Column(nullable = false)
    private String illness; // 지병

    @Column(nullable = false)
    private String medication;  // 복용중인약물

    @Column
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @ManyToMany(mappedBy = "seniors")
    private List<Guardian> guardians;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;
}
