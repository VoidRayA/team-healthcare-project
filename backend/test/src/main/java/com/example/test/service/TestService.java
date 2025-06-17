package com.example.test.service;

import com.example.test.domain.*;
import com.example.test.dto.TestDtos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TestService {
    private final TestGuardianRepository guardianRepository;
    private final TestSeniorRepository seniorRepository;
    private final TestRelationsRepository relationsRepository;

    @Transactional
    public TestDtos.TestResponseDto createTest(TestDtos.TestCreateRequestDto requesDto, String userEmail) {
        TestGuardian guardian = guardianRepository.findByEmail(userEmail)
                .orElseGet(() -> guardianRepository.save(TestGuardian.builder()
                        .name(userEmail.split("@")[0])
                        .email(userEmail)
                        .role(Role.USER)
                        .build()));
        TestSenior senior = TestSenior.builder()
                .text(requesDto.text())
                .completed(false)
                .guardian(guardian)
                .build();

        return new TestDtos.TestResponseDto(seniorRepository.save(senior));
    }

    public List<TestDtos.TestResponseDto> findMySenior(String userEmail) {
        TestGuardian guardian = findByEmail(userEmail);
        return guardianRepository.findByOrderByIdDesc(guardian).stream()
        // guardianRepository.findByGuardianOrderByIdDesc(guardian)
                .map(TestDtos.TestResponseDto::new)
                .collect(Collectors.toList());
    }

    public TestDtos.TestResponseDto toggleSenior(Long id, String userEmail) {
        TestSenior senior = findByIdAndUserEmail(id, userEmail);
    }

}
