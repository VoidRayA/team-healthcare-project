package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.repository.GuardianRepository;
import com.example.backend.repository.SeniorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final GuardianRepository guardianRepository;
    private final SeniorRepository seniorRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) {
        // 보호자 정보 찾기
        Guardians guardians = guardianRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("해당 이름의 보호자를 찾지 못했습니다."));
        // 노인 정보 찾기
        Seniors seniors = seniorRepository.findByGuardianId(guardians.getId())
                .orElseThrow(() -> new RuntimeException("해당 보호자에 대한 노인 정보를 찾을수 없습니다."));
        return new CustomUserDetails(guardians, seniors);
    }
}
