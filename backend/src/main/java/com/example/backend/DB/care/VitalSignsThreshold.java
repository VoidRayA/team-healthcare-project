package com.example.backend.DB.care;

import com.example.backend.DB.VitalSigns;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

// 생체신호 기준치 설정 클래스
@Component
public class VitalSignsThreshold {

    // 혈압 기준치 (수축기/이완기)
    public static class BloodPressure {
        // 수축기 혈압 (bloodPressureHigh)
        public static final int SYSTOLIC_EMERGENCY_HIGH = 180;
        public static final int SYSTOLIC_WARNING_HIGH = 140;
        public static final int SYSTOLIC_WARNING_LOW = 90;
        public static final int SYSTOLIC_EMERGENCY_LOW = 70;

        // 이완기 혈압 (bloodPressureLow)
        public static final int DIASTOLIC_EMERGENCY_HIGH = 120;
        public static final int DIASTOLIC_WARNING_HIGH = 90;
        public static final int DIASTOLIC_WARNING_LOW = 60;
        public static final int DIASTOLIC_EMERGENCY_LOW = 40;
    }

    // 심박수 기준치 (heartRate)
    public static class HeartRate {
        public static final int EMERGENCY_HIGH = 120;
        public static final int WARNING_HIGH = 100;
        public static final int WARNING_LOW = 50;
        public static final int EMERGENCY_LOW = 40;
    }

    // 체온 기준치 (bodyTemperature)
    public static class Temperature {
        public static final BigDecimal EMERGENCY_HIGH = new BigDecimal("39.00");
        public static final BigDecimal WARNING_HIGH = new BigDecimal("37.50");
        public static final BigDecimal WARNING_LOW = new BigDecimal("35.00");
        public static final BigDecimal EMERGENCY_LOW = new BigDecimal("34.00");
    }

    // 혈당 기준치 (bloodSugar)
    public static class BloodSugar {
        public static final int EMERGENCY_HIGH = 400;
        public static final int WARNING_HIGH = 200;
        public static final int WARNING_LOW = 70;
        public static final int EMERGENCY_LOW = 50;
    }

    // 알림 타입 결정 메서드
    public static String determineAlertType(VitalSigns vitalSigns) {
        // EMERGENCY 조건들
        if (isEmergencyCondition(vitalSigns)) {
            return "EMERGENCY";
        }

        // WARNING 조건들
        if (isWarningCondition(vitalSigns)) {
            return "WARNING";
        }

        return "INFO";
    }

    private static boolean isEmergencyCondition(VitalSigns vitalSigns) {
        // 수축기 혈압 응급상황
        if (vitalSigns.getBloodPressureHigh() != null &&
                (vitalSigns.getBloodPressureHigh() >= BloodPressure.SYSTOLIC_EMERGENCY_HIGH ||
                        vitalSigns.getBloodPressureHigh() <= BloodPressure.SYSTOLIC_EMERGENCY_LOW)) {
            return true;
        }

        // 이완기 혈압 응급상황
        if (vitalSigns.getBloodPressureLow() != null &&
                (vitalSigns.getBloodPressureLow() >= BloodPressure.DIASTOLIC_EMERGENCY_HIGH ||
                        vitalSigns.getBloodPressureLow() <= BloodPressure.DIASTOLIC_EMERGENCY_LOW)) {
            return true;
        }

        // 심박수 응급상황
        if (vitalSigns.getHeartRate() != null &&
                (vitalSigns.getHeartRate() >= HeartRate.EMERGENCY_HIGH ||
                        vitalSigns.getHeartRate() <= HeartRate.EMERGENCY_LOW)) {
            return true;
        }

        // 체온 응급상황
        if (vitalSigns.getBodyTemperature() != null &&
                (vitalSigns.getBodyTemperature().compareTo(Temperature.EMERGENCY_HIGH) >= 0 ||
                        vitalSigns.getBodyTemperature().compareTo(Temperature.EMERGENCY_LOW) <= 0)) {
            return true;
        }

        // 혈당 응급상황
        if (vitalSigns.getBloodSugar() != null &&
                (vitalSigns.getBloodSugar() >= BloodSugar.EMERGENCY_HIGH ||
                        vitalSigns.getBloodSugar() <= BloodSugar.EMERGENCY_LOW)) {
            return true;
        }

        return false;
    }

    private static boolean isWarningCondition(VitalSigns vitalSigns) {
        // 수축기 혈압 주의상황
        if (vitalSigns.getBloodPressureHigh() != null &&
                (vitalSigns.getBloodPressureHigh() >= BloodPressure.SYSTOLIC_WARNING_HIGH ||
                        vitalSigns.getBloodPressureHigh() <= BloodPressure.SYSTOLIC_WARNING_LOW)) {
            return true;
        }

        // 이완기 혈압 주의상황
        if (vitalSigns.getBloodPressureLow() != null &&
                (vitalSigns.getBloodPressureLow() >= BloodPressure.DIASTOLIC_WARNING_HIGH ||
                        vitalSigns.getBloodPressureLow() <= BloodPressure.DIASTOLIC_WARNING_LOW)) {
            return true;
        }

        // 심박수 주의상황
        if (vitalSigns.getHeartRate() != null &&
                (vitalSigns.getHeartRate() >= HeartRate.WARNING_HIGH ||
                        vitalSigns.getHeartRate() <= HeartRate.WARNING_LOW)) {
            return true;
        }

        // 체온 주의상황
        if (vitalSigns.getBodyTemperature() != null &&
                (vitalSigns.getBodyTemperature().compareTo(Temperature.WARNING_HIGH) >= 0 ||
                        vitalSigns.getBodyTemperature().compareTo(Temperature.WARNING_LOW) <= 0)) {
            return true;
        }

        // 혈당 주의상황
        if (vitalSigns.getBloodSugar() != null &&
                (vitalSigns.getBloodSugar() >= BloodSugar.WARNING_HIGH ||
                        vitalSigns.getBloodSugar() <= BloodSugar.WARNING_LOW)) {
            return true;
        }

        return false;
    }

    // 구체적인 위험 요소 반환
    public static String getAbnormalValues(VitalSigns vitalSigns) {
        StringBuilder abnormalValues = new StringBuilder();

        // 혈압 체크
        if (vitalSigns.getBloodPressureHigh() != null) {
            if (vitalSigns.getBloodPressureHigh() >= BloodPressure.SYSTOLIC_EMERGENCY_HIGH) {
                abnormalValues.append("수축기혈압 위험 상승(").append(vitalSigns.getBloodPressureHigh()).append("), ");
            } else if (vitalSigns.getBloodPressureHigh() <= BloodPressure.SYSTOLIC_EMERGENCY_LOW) {
                abnormalValues.append("수축기혈압 위험 하강(").append(vitalSigns.getBloodPressureHigh()).append("), ");
            } else if (vitalSigns.getBloodPressureHigh() >= BloodPressure.SYSTOLIC_WARNING_HIGH) {
                abnormalValues.append("수축기혈압 상승(").append(vitalSigns.getBloodPressureHigh()).append("), ");
            } else if (vitalSigns.getBloodPressureHigh() <= BloodPressure.SYSTOLIC_WARNING_LOW) {
                abnormalValues.append("수축기혈압 하강(").append(vitalSigns.getBloodPressureHigh()).append("), ");
            }
        }

        if (vitalSigns.getBloodPressureLow() != null) {
            if (vitalSigns.getBloodPressureLow() >= BloodPressure.DIASTOLIC_EMERGENCY_HIGH) {
                abnormalValues.append("이완기혈압 위험 상승(").append(vitalSigns.getBloodPressureLow()).append("), ");
            } else if (vitalSigns.getBloodPressureLow() <= BloodPressure.DIASTOLIC_EMERGENCY_LOW) {
                abnormalValues.append("이완기혈압 위험 하강(").append(vitalSigns.getBloodPressureLow()).append("), ");
            } else if (vitalSigns.getBloodPressureLow() >= BloodPressure.DIASTOLIC_WARNING_HIGH) {
                abnormalValues.append("이완기혈압 상승(").append(vitalSigns.getBloodPressureLow()).append("), ");
            } else if (vitalSigns.getBloodPressureLow() <= BloodPressure.DIASTOLIC_WARNING_LOW) {
                abnormalValues.append("이완기혈압 하강(").append(vitalSigns.getBloodPressureLow()).append("), ");
            }
        }

        // 심박수 체크
        if (vitalSigns.getHeartRate() != null) {
            if (vitalSigns.getHeartRate() >= HeartRate.EMERGENCY_HIGH) {
                abnormalValues.append("심박수 위험 상승(").append(vitalSigns.getHeartRate()).append("), ");
            } else if (vitalSigns.getHeartRate() <= HeartRate.EMERGENCY_LOW) {
                abnormalValues.append("심박수 위험 하강(").append(vitalSigns.getHeartRate()).append("), ");
            } else if (vitalSigns.getHeartRate() >= HeartRate.WARNING_HIGH) {
                abnormalValues.append("심박수 상승(").append(vitalSigns.getHeartRate()).append("), ");
            } else if (vitalSigns.getHeartRate() <= HeartRate.WARNING_LOW) {
                abnormalValues.append("심박수 하강(").append(vitalSigns.getHeartRate()).append("), ");
            }
        }

        // 체온 체크
        if (vitalSigns.getBodyTemperature() != null) {
            if (vitalSigns.getBodyTemperature().compareTo(Temperature.EMERGENCY_HIGH) >= 0) {
                abnormalValues.append("체온 위험 상승(").append(vitalSigns.getBodyTemperature()).append("℃), ");
            } else if (vitalSigns.getBodyTemperature().compareTo(Temperature.EMERGENCY_LOW) <= 0) {
                abnormalValues.append("체온 위험 하강(").append(vitalSigns.getBodyTemperature()).append("℃), ");
            } else if (vitalSigns.getBodyTemperature().compareTo(Temperature.WARNING_HIGH) >= 0) {
                abnormalValues.append("체온 상승(").append(vitalSigns.getBodyTemperature()).append("℃), ");
            } else if (vitalSigns.getBodyTemperature().compareTo(Temperature.WARNING_LOW) <= 0) {
                abnormalValues.append("체온 하강(").append(vitalSigns.getBodyTemperature()).append("℃), ");
            }
        }

        // 혈당 체크
        if (vitalSigns.getBloodSugar() != null) {
            if (vitalSigns.getBloodSugar() >= BloodSugar.EMERGENCY_HIGH) {
                abnormalValues.append("혈당 위험 상승(").append(vitalSigns.getBloodSugar()).append("mg/dL), ");
            } else if (vitalSigns.getBloodSugar() <= BloodSugar.EMERGENCY_LOW) {
                abnormalValues.append("혈당 위험 하강(").append(vitalSigns.getBloodSugar()).append("mg/dL), ");
            } else if (vitalSigns.getBloodSugar() >= BloodSugar.WARNING_HIGH) {
                abnormalValues.append("혈당 상승(").append(vitalSigns.getBloodSugar()).append("mg/dL), ");
            } else if (vitalSigns.getBloodSugar() <= BloodSugar.WARNING_LOW) {
                abnormalValues.append("혈당 하강(").append(vitalSigns.getBloodSugar()).append("mg/dL), ");
            }
        }

        // 마지막 쉼표 제거
        if (abnormalValues.length() > 0) {
            abnormalValues.setLength(abnormalValues.length() - 2);
        }

        return abnormalValues.toString();
    }
}
