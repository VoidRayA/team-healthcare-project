package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Role;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.UserDtos;
import com.example.backend.repository.GuardianRepository;
import com.example.backend.repository.SeniorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final GuardianRepository guardianRepository;
    private final SeniorRepository seniorRepository;

    // 사용자 조회 및 생성
    @Transactional
    public UserDtos.SeniorResponseDto createUser(UserDtos.SeniorCreateRequestDto dto, Integer userId, String name) {
        Guardians guardian = guardianRepository.findById(userId)
                .orElseGet(() -> guardianRepository.save(Guardians.builder()
                        .name(name)
                        .relationship("보호자")
                        .role(Role.USER)
                        .build()));
        Seniors seniors = Seniors.builder()
                .guardians((List<Seniors>) guardian) // 핵심: 여기서 연결
                .guardianId(Math.toIntExact(dto.guardianId()))
                .seniorName(dto.senior_name())
                .birth_date(dto.birth_date())
                .gender(dto.gender())
                .address(dto.address())
                .emergency_contact(dto.emergency_contact())
                .chronic_diseases(dto.chronic_diseases())
                .medications(dto.medications())
                .notes(dto.notes())
                .build();

        seniorRepository.save(seniors);

        return new UserDtos.SeniorResponseDto(seniors);
    }
    // 사용자 정보 목록 조회 서비스
    public List<UserDtos.SeniorResponseDto> findMySenior(String seniorName) {
        List<Seniors> seniors = seniorRepository.findBySeniorName(seniorName);

        if (seniors.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않는 어르신");
        }

        return seniors.stream()
                .map(UserDtos.SeniorResponseDto::new)
                .collect(Collectors.toList());
    }
    public List<UserDtos.GuardianResponseDto> findMyGuardian(String guardianName){
        List<Guardians> guardian = guardianRepository.findByGuardianName(guardianName);

        if (guardian.isEmpty()){
            throw new IllegalArgumentException("존재하지 않는 보호자");
        }

        return guardian.stream()
                .map(UserDtos.GuardianResponseDto::new)
                .collect(Collectors.toList());
    }
//    // 약물 복용 여부 확인 토글 서비스
//    public UserDtos.SeniorResponseDto toggleSenior(Integer id, String userEmail) {
//        Seniors seniors = findByIdAndUserEmail2(id, userEmail);
//        seniors.setCompleted(!seniors.isCompleted());
//        return new UserDtos.SeniorResponseDto(seniors);
//    }
    // 사용자 정보 삭제 서비스
    // senior 삭제
    public void deleteSenior(Integer id, String userEmail) {
        Seniors seniors = findByIdAndUserEmail2(id, userEmail);
        seniorRepository.delete(seniors);
    }
    // guardian 삭제
    public void deleteGuardian(Integer id, String userEmail) {
        Guardians guardian = findByIdAndUserEmail(id, userEmail);
        guardianRepository.delete(guardian);
    }
    // 사용자 소유 확인 서비스
    // Senior 확인
    private Seniors findByIdAndUserEmail2(Integer id, String userEmail) {
        return seniorRepository.findById(id)
//                .filter(seniors -> seniors.getGuardian().getGuardian_email().equals(userEmail))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 권한이 없는 사용자입니다"));
    }
    // guardian 확인
    private Guardians findByIdAndUserEmail(Integer id, String userEmail) {
        return guardianRepository.findById(id)
//                .filter(guardian -> guardian.getGuardian_email().equals(userEmail))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 권한이 없는 사용자입니다"));
    }
}
