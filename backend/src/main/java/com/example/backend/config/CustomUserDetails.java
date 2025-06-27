package com.example.backend.config;

import com.example.backend.DB.Guardians;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@AllArgsConstructor
@Getter
public class CustomUserDetails implements UserDetails {

    private final Guardians guardians;

    @Override
    public String getUsername() {
        return guardians.getLoginId();
    }

    public String getGuardianName() {
        return guardians.getGuardianName();
    }

    @Override
    public String getPassword() {
        return guardians.getLoginPw();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ✅ 기존 Role enum의 key 사용 (ROLE_GUARDIAN, ROLE_ADMIN 등)
        return List.of(new SimpleGrantedAuthority(guardians.getRole().getKey()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return guardians.getIsActive();
    }
}