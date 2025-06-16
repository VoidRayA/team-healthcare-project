package com.example.test.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestSeniorRepository extends JpaRepository<TestSenior, Long> {
    List<TestSenior> findByUserOrderByIdDesc(TestGuardian testUser);
}
