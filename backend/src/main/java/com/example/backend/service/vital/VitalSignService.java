package com.example.backend.service.vital;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.VitalSigns;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.VitalSignsDto;
import com.example.backend.repository.SeniorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VitalSignService {

    private final SeniorRepository seniorRepository;

    // 생성 서비스
    @Transactional
    public SeniorDto.SeniorVitalDto createVital(Integer seniorId, VitalSignsDto.VitalCreateDto dto, Guardians guardian){
        // senior 조회
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId,guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 보호 대상자를 찾을수 없습니다"));
        // 생체 기록 생성
        VitalSigns vitalSigns = VitalSigns.builder()
                .senior(senior)
                .measurementTime(dto.measurementTime())
                .bloodPressureHigh(dto.bloodPressureHigh())
                .bloodPressureLow(dto.bloodPressureLow())
                .heartRate(dto.heartRate())
                .bloodSugar(dto.bloodSugar())
                .bodyTemperature(dto.bodyTemperature())
                .notes(dto.notes())
                .build();

        senior.addVitalSign(vitalSigns);

        seniorRepository.save(senior);

        return convertToSeniorVitalDto(senior);
    }

    // 조회 서비스
    public SeniorDto.SeniorVitalDto searchVital(Integer seniorId, Guardians guardian){
        Seniors seniors = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 보호 대상자를 찾을 수 없습니다."));

        return convertToSeniorVitalDto(seniors);
    }

    // 삭제 서비스
    @Transactional
    public SeniorDto.SeniorVitalDto deleteVital(Integer seniorId, Integer vitalId, Guardians guardian){
        Seniors seniors = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 보호 대상자를 찾을 수 없습니다."));
        List<VitalSigns> vitalSigns = Optional.ofNullable(seniors.getVitalSigns())
                .orElse(new ArrayList<>());

        VitalSigns vitalSignDelete = vitalSigns.stream()
                .filter(a -> a.getId().equals(vitalId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("해당 생체기록을 찾을 수 없습니다."));

        seniors.getVitalSigns().remove(vitalSignDelete);
        vitalSignDelete.setSenior(null);

        seniorRepository.save(seniors);

        return convertToSeniorVitalDto(seniors);
    }
    // 수정 서비스
    @Transactional
    public SeniorDto.SeniorVitalDto updateVital(Integer seniorId, Integer vitalId, VitalSignsDto.VitalUpdateDto updateDto, Guardians guardian){
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new SecurityException("해당 보호 대상자에 대한 접근 권한이 없습니다."));

        VitalSigns vitalSign = senior.getVitalSigns().stream()
                .filter(vital -> vital.getId().equals(vitalId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("해당 생체기록을 찾을 수 없습니다."));

        // 수정 로직 (필요한 필드만 업데이트)
        if (updateDto.measurementTime() != null) {
            vitalSign.setMeasurementTime(updateDto.measurementTime());
        }
        if (updateDto.bloodPressureHigh() != null) {
            vitalSign.setBloodPressureHigh(updateDto.bloodPressureHigh());
        }
        if (updateDto.bloodPressureLow() != null) {
            vitalSign.setBloodPressureLow(updateDto.bloodPressureLow());
        }
        if (updateDto.heartRate() != null) {
            vitalSign.setHeartRate(updateDto.heartRate());
        }
        if (updateDto.bloodSugar() != null) {
            vitalSign.setBloodSugar(updateDto.bloodSugar());
        }
        if (updateDto.bodyTemperature() != null) {
            vitalSign.setBodyTemperature(updateDto.bodyTemperature());
        }
        if (updateDto.notes() != null) {
            vitalSign.setNotes(updateDto.notes());
        }

        seniorRepository.save(senior);

        return convertToSeniorVitalDto(senior);
    }


    // 생체기록용 변환 메서드
    private SeniorDto.SeniorVitalDto convertToSeniorVitalDto(Seniors senior) {
        // 생체기록들을 DTO로 변환
        List<VitalSignsDto.VitalSearchDto> vitalSignsDto = Optional.ofNullable(senior.getVitalSigns())
                .orElse(new ArrayList<>())
                .stream()
                .sorted(Comparator.comparing(VitalSigns::getMeasurementTime).reversed()) // 측정시간 기준 내림차순
                .map(VitalSignsDto.VitalSearchDto::from) // from() 메서드 활용
                .collect(Collectors.toList());

        return SeniorDto.SeniorVitalDto.builder()
                .id(senior.getId())
                .seniorName(senior.getSeniorName())
                .vitalSigns(vitalSignsDto)
                .build();
    }
}
