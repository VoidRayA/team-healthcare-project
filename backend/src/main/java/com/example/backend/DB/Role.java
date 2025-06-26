package com.example.backend.DB;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    GUEST("ROLE_GUEST", "손님"),
    USER("ROLE_USER", "일반 사용자"),
    GUARDIAN("ROLE_GUARDIAN", "보호자"),        // ✅ 추가
    ADMIN("ROLE_ADMIN", "관리자");              // ✅ 추가

    private final String key;
    private final String title;
}