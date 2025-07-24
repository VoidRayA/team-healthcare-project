// 기본 바이탈 설정값들
export const DEFAULT_VITAL_SETTINGS = {
  bloodPressureAttentionMax: 180,
  bloodPressureAttentionMin: 90,
  bloodPressureCautionMax: 140,
  bloodPressureCautionMin: 100,
  diastolicAttentionMax: 110,
  diastolicAttentionMin: 60,
  diastolicCautionMax: 90,
  diastolicCautionMin: 65,
  heartRateAttentionMax: 100,
  heartRateAttentionMin: 50,
  heartRateCautionMax: 90,
  heartRateCautionMin: 60,
  bodyTemperatureAttentionMax: 38.0,
  bodyTemperatureAttentionMin: 35.5,
  bodyTemperatureCautionMax: 37.5,
  bodyTemperatureCautionMin: 36.0,
  bloodSugarAttentionMax: 250,
  bloodSugarAttentionMin: 70,
  bloodSugarCautionMax: 180,
  bloodSugarCautionMin: 80
};

// 기본 알림 설정
export const DEFAULT_ALERT_SETTINGS = {
  attentionRatioThreshold: 10,
  cautionRatioThreshold: 30,
  attentionCountThreshold: 3,
  cautionCountThreshold: 5,
  emergencyCountThreshold: 1,
  useRatioThreshold: true,
  useCountThreshold: true,
  useEmergencyAlert: true
};

// 기준선 기본값 (모두 숨김)
export const DEFAULT_THRESHOLD_LINES = {
  bloodPressureAttentionMax: false,
  bloodPressureAttentionMin: false,
  bloodPressureCautionMax: false,
  bloodPressureCautionMin: false,
  diastolicAttentionMax: false,
  diastolicAttentionMin: false,
  diastolicCautionMax: false,
  diastolicCautionMin: false,
  heartRateAttentionMax: false,
  heartRateAttentionMin: false,
  heartRateCautionMax: false,
  heartRateCautionMin: false,
  temperatureAttentionMax: false,
  temperatureCautionMax: false
};
