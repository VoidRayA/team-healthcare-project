package com.example.backend.domain.DB;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Senior extends User {
    @Column(nullable = false)
    private LocalDate 생년월일;

    @Column(nullable = false)
    private char gender;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String emergency_contact;

    @Column(nullable = false)
    private String 지병;

    @Column(nullable = false)
    private String 복용중인약물;

    @Column
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @ManyToMany(mappedBy = "seniors")
    private List<Guardian> guardians;
}
