import { useState, useEffect } from 'react';
import { getMainChartLegendSettings, saveMainChartLegendSetting } from '../../../../api/apiClient';
import { getAuthToken } from '../../../../utils/auth';

// 기본 범례 설정 (DB 저장 형식에 맞춤 키 사용)
const DEFAULT_LEGEND_SETTINGS = {
  'legend_systolic_bp': true,      // 수축기 혈압
  'legend_diastolic_bp': true,     // 이완기 혈압
  'legend_heart_rate': true,       // 심박수
  'legend_temperature': true,      // 체온
  'legend_blood_sugar': true       // 혈당
};

// 키 변환 함수들
const convertToSafeKey = (displayKey) => {
  // 표시용 키를 DB 저장용 키로 변환하는 매핑
  const keyMapping = {
    '수축기 혈압 (mmHg)': 'legend_systolic_bp',
    '이완기 혈압 (mmHg)': 'legend_diastolic_bp',
    '심박수 (bpm)': 'legend_heart_rate',
    '체온 (°C)': 'legend_temperature',
    '혈당 (mg/dL)': 'legend_blood_sugar'
  };
  
  return keyMapping[displayKey] || displayKey;
};

const convertToDisplayKey = (safeKey) => {
  // DB 저장용 키를 표시용 키로 변환하는 매핑
  const keyMapping = {
    'legend_systolic_bp': '수축기 혈압 (mmHg)',
    'legend_diastolic_bp': '이완기 혈압 (mmHg)',
    'legend_heart_rate': '심박수 (bpm)',
    'legend_temperature': '체온 (°C)',
    'legend_blood_sugar': '혈당 (mg/dL)'
  };
  
  return keyMapping[safeKey] || safeKey;
};

export const useLegendSettings = () => {
  const [legendSettings, setLegendSettings] = useState(() => {
    // 기본값을 표시용 키로 변환
    const defaultDisplaySettings = {};
    Object.entries(DEFAULT_LEGEND_SETTINGS).forEach(([safeKey, value]) => {
      const displayKey = convertToDisplayKey(safeKey);
      defaultDisplaySettings[displayKey] = value;
    });
    return defaultDisplaySettings;
  });
  
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const loadLegendSettings = async () => {
      try {
        setLoading(true);
        // 인증 토큰에서 guardianId 추출
        const token = getAuthToken();
        if (!token) {
          console.warn('인증 토큰이 없어 기본값 사용');
          return;
        }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        let guardianId = payload.guardianId || payload.guardian_id || payload.id;
        
        // guardianId가 없으면 오류 발생
        if (!guardianId) {
          console.error('❌ JWT에 guardianId가 없음 - payload:', payload);
          throw new Error('JWT에 guardianId가 포함되지 않았습니다. 다시 로그인해주세요.');
        }
        
        // DB에서 범례 설정 조회
        const savedSettings = await getMainChartLegendSettings(guardianId, 'vital_detail');
        
        // 저장된 설정이 있으면 병합, 없으면 기본값 사용
        if (Object.keys(savedSettings).length > 0) {
          const displaySettings = {};
          
          // 기본값을 먼저 설정
          Object.entries(DEFAULT_LEGEND_SETTINGS).forEach(([safeKey, value]) => {
            const displayKey = convertToDisplayKey(safeKey);
            displaySettings[displayKey] = value;
          });
          
          // 저장된 설정으로 덮어쓰기 (DB 키를 표시용 키로 변환)
          Object.entries(savedSettings).forEach(([dbKey, value]) => {
            const displayKey = convertToDisplayKey(dbKey);
            displaySettings[displayKey] = value;
          });
          
          setLegendSettings(displaySettings);
          console.log('💾 DB에서 범례 설정 로드:', displaySettings);
        } else {
          console.log('🆕 저장된 범례 설정 없음, 기본값 사용');
        }
      } catch (error) {
        console.error('범례 설정 로드 실패:', error);
        // 오류 시 기본값 사용
      } finally {
        setLoading(false);
      }
    };

    loadLegendSettings();
  }, []);

  // 범례 클릭 핸들러
  const handleLegendClick = async (displayKey, isVisible) => {
    try {
      // 즉시 UI 업데이트
      setLegendSettings(prev => ({
        ...prev,
        [displayKey]: isVisible
      }));
      
      // 서버에 저장 (displayKey를 그대로 전달, 백엔드에서 DB 키로 변환)
      await saveMainChartLegendSetting(displayKey, isVisible, 'vital_detail');
      console.log(`✅ 범례 설정 DB 저장 성공: ${displayKey} = ${isVisible}`);
      
    } catch (error) {
      console.error('범례 설정 저장 실패:', error);
      
      // 서버 오류 타입에 따라 다른 처리
      if (error.response?.status === 500) {
        console.warn('🚨 서버 내부 오류: 범례 설정 임시 로컬 저장만 수행');
        // UI는 업데이트된 상태로 유지 (로컬 저장만)
        return; // 상태 될리기하지 않음
      }
      
      // 그 외 오류는 이전 상태로 복구
      setLegendSettings(prev => ({
        ...prev,
        [displayKey]: !isVisible
      }));
      
      // 사용자에게 알림 (선택사항)
      console.warn('⚠️ 범례 설정 저장에 실패했지만 임시로 로컬에서 유지됩니다.');
    }
  };

  return {
    legendSettings,
    setLegendSettings,
    handleLegendClick,
    loading
  };
};
