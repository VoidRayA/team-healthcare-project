package com.example.backend.DB;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

@Entity
@Table(name = "senior_guardian_relations")
@Data
@Builder
public class GuardianSenior {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "guardian_id")
    private Guardians guardian;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "senior_id")
    private Seniors senior;

    @Column(name = "is_primary")
    private boolean isPrimary;
}
