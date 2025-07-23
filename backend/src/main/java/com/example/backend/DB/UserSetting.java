package com.example.backend.DB;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_setting")
public class UserSetting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "guardian_id")
    private Long guardianId;
    
    @Column(name = "category", length = 255)
    private String category;
    
    @Column(name = "sub_category", length = 255) 
    private String subCategory;
    
    @Column(name = "`values`", columnDefinition = "TEXT")
    private String values;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 기본 생성자
    public UserSetting() {}
    
    // 생성자
    public UserSetting(Long guardianId, String category, String subCategory, String values) {
        this.guardianId = guardianId;
        this.category = category;
        this.subCategory = subCategory;
        this.values = values;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getter와 Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getGuardianId() {
        return guardianId;
    }
    
    public void setGuardianId(Long guardianId) {
        this.guardianId = guardianId;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getSubCategory() {
        return subCategory;
    }
    
    public void setSubCategory(String subCategory) {
        this.subCategory = subCategory;
    }
    
    public String getValues() {
        return values;
    }
    
    public void setValues(String values) {
        this.values = values;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}