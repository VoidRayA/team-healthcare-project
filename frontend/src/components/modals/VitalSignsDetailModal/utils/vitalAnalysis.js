import { DEFAULT_VITAL_SETTINGS } from '../constants/vitalSettings';

// 설정값 가져오는 헬퍼 함수
const getSettingValue = (userSettings, key, defaultValue) => {
  if (userSettings && userSettings[key]) {
    const value = parseFloat(userSettings[key]);
    return isNaN(value) ? defaultValue : value;
  }
  return defaultValue;
};

// 상태 분석 함수
export const analyzeVitalStatus = (data, userSettings = null, alertSettings = null) => {
  if (!data || data.length === 0) return { 
    status: 'no-data', 
    message: '데이터 없음',
    counts: { emergency: 0, attention: 0, caution: 0, normal: 0 },
    details: { bloodPressure: {}, heartRate: {}, temperature: {}, bloodSugar: {} }
  };

  let attentionCount = 0;
  let cautionCount = 0;
  let normalCount = 0;
  let emergencyCount = 0;

  // 항목별 상세 카운트
  const itemDetails = {
    bloodPressure: { attention: 0, caution: 0, normal: 0, emergency: 0 },
    heartRate: { attention: 0, caution: 0, normal: 0, emergency: 0 },
    temperature: { attention: 0, caution: 0, normal: 0, emergency: 0 },
    bloodSugar: { attention: 0, caution: 0, normal: 0, emergency: 0 }
  };

  // 설정값들 
  const settings = {
    bloodPressureAttentionMax: getSettingValue(userSettings, 'bloodPressureAttentionMax', DEFAULT_VITAL_SETTINGS.bloodPressureAttentionMax),
    bloodPressureAttentionMin: getSettingValue(userSettings, 'bloodPressureAttentionMin', DEFAULT_VITAL_SETTINGS.bloodPressureAttentionMin),
    bloodPressureCautionMax: getSettingValue(userSettings, 'bloodPressureCautionMax', DEFAULT_VITAL_SETTINGS.bloodPressureCautionMax),
    bloodPressureCautionMin: getSettingValue(userSettings, 'bloodPressureCautionMin', DEFAULT_VITAL_SETTINGS.bloodPressureCautionMin),
    diastolicAttentionMax: getSettingValue(userSettings, 'diastolicAttentionMax', DEFAULT_VITAL_SETTINGS.diastolicAttentionMax),
    diastolicAttentionMin: getSettingValue(userSettings, 'diastolicAttentionMin', DEFAULT_VITAL_SETTINGS.diastolicAttentionMin),
    diastolicCautionMax: getSettingValue(userSettings, 'diastolicCautionMax', DEFAULT_VITAL_SETTINGS.diastolicCautionMax),
    diastolicCautionMin: getSettingValue(userSettings, 'diastolicCautionMin', DEFAULT_VITAL_SETTINGS.diastolicCautionMin),
    heartRateAttentionMax: getSettingValue(userSettings, 'heartRateAttentionMax', DEFAULT_VITAL_SETTINGS.heartRateAttentionMax),
    heartRateAttentionMin: getSettingValue(userSettings, 'heartRateAttentionMin', DEFAULT_VITAL_SETTINGS.heartRateAttentionMin),
    heartRateCautionMax: getSettingValue(userSettings, 'heartRateCautionMax', DEFAULT_VITAL_SETTINGS.heartRateCautionMax),
    heartRateCautionMin: getSettingValue(userSettings, 'heartRateCautionMin', DEFAULT_VITAL_SETTINGS.heartRateCautionMin),
    bodyTemperatureAttentionMax: getSettingValue(userSettings, 'bodyTemperatureAttentionMax', DEFAULT_VITAL_SETTINGS.bodyTemperatureAttentionMax),
    bodyTemperatureAttentionMin: getSettingValue(userSettings, 'bodyTemperatureAttentionMin', DEFAULT_VITAL_SETTINGS.bodyTemperatureAttentionMin),
    bodyTemperatureCautionMax: getSettingValue(userSettings, 'bodyTemperatureCautionMax', DEFAULT_VITAL_SETTINGS.bodyTemperatureCautionMax),
    bodyTemperatureCautionMin: getSettingValue(userSettings, 'bodyTemperatureCautionMin', DEFAULT_VITAL_SETTINGS.bodyTemperatureCautionMin),
    bloodSugarAttentionMax: getSettingValue(userSettings, 'bloodSugarAttentionMax', DEFAULT_VITAL_SETTINGS.bloodSugarAttentionMax),
    bloodSugarAttentionMin: getSettingValue(userSettings, 'bloodSugarAttentionMin', DEFAULT_VITAL_SETTINGS.bloodSugarAttentionMin),
    bloodSugarCautionMax: getSettingValue(userSettings, 'bloodSugarCautionMax', DEFAULT_VITAL_SETTINGS.bloodSugarCautionMax),
    bloodSugarCautionMin: getSettingValue(userSettings, 'bloodSugarCautionMin', DEFAULT_VITAL_SETTINGS.bloodSugarCautionMin)
  };

  data.forEach(item => {
    // 각 측정 시점에서 가장 심각한 상태를 찾기
    let worstStatus = 'normal';
    let worstLevel = 0; // 0: normal, 1: caution, 2: attention, 3: emergency

    // 혈압 판정 로직
    let bpStatus = 'normal';
    let bpLevel = 0;
    if (item.bloodPressureHigh !== null || item.bloodPressureLow !== null) {
      if (item.bloodPressureHigh >= 200 || item.bloodPressureHigh <= 70 ||
          item.bloodPressureLow >= 130 || item.bloodPressureLow <= 40) {
        bpStatus = 'emergency';
        bpLevel = 3;
      } else if (item.bloodPressureHigh >= settings.bloodPressureAttentionMax || 
          item.bloodPressureHigh <= settings.bloodPressureAttentionMin ||
          item.bloodPressureLow >= settings.diastolicAttentionMax || 
          item.bloodPressureLow <= settings.diastolicAttentionMin) {
        bpStatus = 'attention';
        bpLevel = 2;
      } else if (item.bloodPressureHigh >= settings.bloodPressureCautionMax || 
                 item.bloodPressureHigh <= settings.bloodPressureCautionMin ||
                 item.bloodPressureLow >= settings.diastolicCautionMax || 
                 item.bloodPressureLow <= settings.diastolicCautionMin) {
        bpStatus = 'caution';
        bpLevel = 1;
      }
    }
    itemDetails.bloodPressure[bpStatus]++;
    if (bpLevel > worstLevel) { worstStatus = bpStatus; worstLevel = bpLevel; }

    // 심박수 판정
    let hrStatus = 'normal';
    let hrLevel = 0;
    if (item.heartRate !== null) {
      if (item.heartRate >= 150 || item.heartRate <= 30) {
        hrStatus = 'emergency';
        hrLevel = 3;
      } else if (item.heartRate >= settings.heartRateAttentionMax || 
          item.heartRate <= settings.heartRateAttentionMin) {
        hrStatus = 'attention';
        hrLevel = 2;
      } else if (item.heartRate >= settings.heartRateCautionMax || 
                 item.heartRate <= settings.heartRateCautionMin) {
        hrStatus = 'caution';
        hrLevel = 1;
      }
    }
    itemDetails.heartRate[hrStatus]++;
    if (hrLevel > worstLevel) { worstStatus = hrStatus; worstLevel = hrLevel; }

    // 체온 판정
    let tempStatus = 'normal';
    let tempLevel = 0;
    if (item.bodyTemperature !== null) {
      if (item.bodyTemperature >= 40.0 || item.bodyTemperature <= 34.0) {
        tempStatus = 'emergency';
        tempLevel = 3;
      } else if (item.bodyTemperature >= settings.bodyTemperatureAttentionMax ||
          item.bodyTemperature <= settings.bodyTemperatureAttentionMin) {
        tempStatus = 'attention';
        tempLevel = 2;
      } else if (item.bodyTemperature >= settings.bodyTemperatureCautionMax ||
                 item.bodyTemperature <= settings.bodyTemperatureCautionMin) {
        tempStatus = 'caution';
        tempLevel = 1;
      }
    }
    itemDetails.temperature[tempStatus]++;
    if (tempLevel > worstLevel) { worstStatus = tempStatus; worstLevel = tempLevel; }

    // 혈당 판정
    let bsStatus = 'normal';
    let bsLevel = 0;
    if (item.bloodSugar !== null) {
      if (item.bloodSugar >= 400 || item.bloodSugar <= 40) {
        bsStatus = 'emergency';
        bsLevel = 3;
      } else if (item.bloodSugar >= settings.bloodSugarAttentionMax ||
          item.bloodSugar <= settings.bloodSugarAttentionMin) {
        bsStatus = 'attention';
        bsLevel = 2;
      } else if (item.bloodSugar >= settings.bloodSugarCautionMax ||
                 item.bloodSugar <= settings.bloodSugarCautionMin) {
        bsStatus = 'caution';
        bsLevel = 1;
      }
    }
    itemDetails.bloodSugar[bsStatus]++;
    if (bsLevel > worstLevel) { worstStatus = bsStatus; worstLevel = bsLevel; }

    // 이 측정 시점의 최종 상태로 카운트 (중복 제거)
    switch (worstStatus) {
      case 'emergency':
        emergencyCount++;
        break;
      case 'attention':
        attentionCount++;
        break;
      case 'caution':
        cautionCount++;
        break;
      default:
        normalCount++;
        break;
    }
  });

  const total = data.length;
  const attentionRatio = (attentionCount / total) * 100;
  const cautionRatio = (cautionCount / total) * 100;

  // 기본 알림 설정값
  const currentAlertSettings = alertSettings || {
    attentionRatioThreshold: 10,
    cautionRatioThreshold: 30,
    attentionCountThreshold: 3,
    cautionCountThreshold: 5,
    emergencyCountThreshold: 1,
    useRatioThreshold: true,
    useCountThreshold: true,
    useEmergencyAlert: true
  };

  const attentionThreshold = currentAlertSettings.attentionRatioThreshold;
  const cautionThreshold = currentAlertSettings.cautionRatioThreshold;
  const emergencyThreshold = currentAlertSettings.emergencyCountThreshold;

  // 응급 상황
  if (currentAlertSettings.useEmergencyAlert && emergencyCount >= emergencyThreshold) {
    return { 
      status: 'emergency', 
      message: '⚡ 즉시 확인 필요',
      counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount },
      details: itemDetails
    };
  }

  // 의료진 상담 권장
  if (currentAlertSettings.useRatioThreshold && attentionRatio >= attentionThreshold) {
    return { 
      status: 'attention', 
      message: `의료진 상담 권장 (${attentionRatio.toFixed(1)}%)`,
      counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount },
      details: itemDetails
    };
  }

  if (currentAlertSettings.useCountThreshold && attentionCount >= currentAlertSettings.attentionCountThreshold) {
    return { 
      status: 'attention', 
      message: `의료진 상담 권장 (${attentionCount}회)`,
      counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount },
      details: itemDetails
    };
  }

  // 계속 관찰 필요
  if ((currentAlertSettings.useRatioThreshold && cautionRatio >= cautionThreshold) ||
      (currentAlertSettings.useCountThreshold && cautionCount >= currentAlertSettings.cautionCountThreshold) ||
      attentionCount > 0) {
    return { 
      status: 'caution', 
      message: `계속 관찰 필요 (${cautionRatio.toFixed(1)}%)`,
      counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount },
      details: itemDetails
    };
  }

  return { 
    status: 'normal', 
    message: '안정적 상태',
    counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount },
    details: itemDetails
  };
};
