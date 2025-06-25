package com.example.backend.DB;

import jakarta.persistence.*;
import lombok.*;
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
public class Seniors {
    @Id
    private Integer id;

    @Column(name = "guardian_id", nullable = false, unique = true)
    private Integer guardianId;

    @Column(name = "senior_name", nullable = false)
    private String seniorName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birth_date;

    @Column
    private char gender;

    @Column
    private String address;

    @Column
    private String emergency_contact;

    @Column
    private String chronic_diseases; // 지병

    @Column
    private String medications;  // 복용중인약물

    @Column
    private String notes;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @ManyToMany
    @JoinTable(
            name = "guardians",
            joinColumns = @JoinColumn(name = "id")
//            inverseJoinColumns = @JoinColumn(name = "guardian_id")
    )
    private List<Seniors> guardians;

//    @ManyToMany(mappedBy = "seniors")
//    private List<Guardians> guardians;

    @Column(nullable = false)
    @Builder.Default
    @Setter
    @Getter
    private boolean completed = false;
}
