package com.example.backend.service.login;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.repository.GuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security에서 사용자 정보를 로드하는 서비스
 * JWT 인증 시 사용자 검증에 사용됨
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final GuardianRepository guardianRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        // 로그인 ID로 사용자 조회
        Guardians guardian = guardianRepository.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + loginId));

        // 계정 활성화 상태 확인
        if (!guardian.getIsActive()) {
            throw new UsernameNotFoundException("비활성화된 계정입니다: " + loginId);
        }

        // CustomUserDetails 객체로 변환하여 반환
        return new CustomUserDetails(guardian);
    }
}