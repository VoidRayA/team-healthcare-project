package com.example.backend.domain.repository;

import com.example.backend.domain.DB.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository {
    List<User> findByEmailAndId (Long id,String email);
}
