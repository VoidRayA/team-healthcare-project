package com.example.test.domain;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface TestGuardianRepository extends CrudRepository<TestGuardian, Long> {
   Optional<TestGuardian> findByname(String name);
}
