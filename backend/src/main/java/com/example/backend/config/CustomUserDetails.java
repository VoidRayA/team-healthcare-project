package com.example.backend.config;

import com.example.backend.DB.Guardians;
//import com.example.backend.DB.Seniors;
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
//    private final Seniors seniors;

    @Override
    public String getUsername() {
        return guardians.getGuardianName();
    }

    public String getGuardiansId() {
        return guardians.getLoginId();
    }

    @Override
    public String getPassword() {
        return guardians.getLoginPw();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(guardians.getRole().name()));
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
        return true;
    }
}
