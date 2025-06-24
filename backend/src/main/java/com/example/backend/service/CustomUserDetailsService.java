package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.repository.GuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final GuardianRepository guardianRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) {
        Guardians guardians = guardianRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("해당 이름의 보호자를 찾지 못했습니다."));
        return new CustomUserDetails(guardians);
    }
}
