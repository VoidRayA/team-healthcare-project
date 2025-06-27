package com.example.backend.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 토큰 생성, 검증, 파싱을 담당하는 클래스
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long jwtExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:mySecretKeyThatIsVeryLongAndSecureForJWTTokenGeneration123456789}") String jwtSecret,
            @Value("${jwt.expiration:86400000}") long jwtExpirationMs) {

        // HMAC SHA 알고리즘용 SecretKey 생성
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * JWT 토큰 생성
     * @param loginId 사용자 로그인 ID
     * @return 생성된 JWT 토큰
     */
    public String generateToken(String loginId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(loginId)                    // 토큰 주체 (사용자 ID)
                .setIssuedAt(now)                       // 토큰 발급 시간
                .setExpiration(expiryDate)              // 토큰 만료 시간
                .signWith(secretKey, SignatureAlgorithm.HS512)  // 서명
                .compact();
    }

    /**
     * JWT 토큰에서 사용자 로그인 ID 추출
     * @param token JWT 토큰
     * @return 사용자 로그인 ID
     */
    public String getLoginIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * JWT 토큰 유효성 검증
     * @param token 검증할 JWT 토큰
     * @return 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            log.error("잘못된 JWT 서명입니다.");
        } catch (MalformedJwtException ex) {
            log.error("잘못된 JWT 토큰입니다.");
        } catch (ExpiredJwtException ex) {
            log.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException ex) {
            log.error("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException ex) {
            log.error("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    /**
     * JWT 토큰의 만료 시간 추출
     * @param token JWT 토큰
     * @return 만료 시간 (Date)
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getExpiration();
    }

    /**
     * JWT 토큰이 만료되었는지 확인
     * @param token JWT 토큰
     * @return 만료되었으면 true, 그렇지 않으면 false
     */
    public boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
}