import { useState, useEffect } from 'react';
import { getMainChartLegendSettings, saveMainChartLegendSetting } from '../../../../api/apiClient';

// 기본 범례 설정 (영어 키 사용)
const DEFAULT_LEGEND_SETTINGS = {
  'systolic_bp': true,      // 수축기 혈압
  'diastolic_bp': true,     // 이완기 혈압
  'heart_rate': true,       // 심박수
  'temperature': true,      // 체온
  'blood_sugar': true       // 혈당
};

// 키 변환 함수들
const convertToSafeKey = (displayKey) => {
  // 표시용 키를 영어 키로 변환하는 매핑
  const keyMapping = {
    '수축기 혈압 (mmHg)': 'systolic_bp',
    '이완기 혈압 (mmHg)': 'diastolic_bp',
    '심박수 (bpm)': 'heart_rate',
    '체온 (°C)': 'temperature',
    '혈당 (mg/dL)': 'blood_sugar'
  };
  
  return keyMapping[displayKey] || displayKey;
};

const convertToDisplayKey = (safeKey) => {
  // 영어 키를 원래 표시용 키로 변환하는 매핑
  const keyMapping = {
    'systolic_bp': '수축기 혈압 (mmHg)',
    'diastolic_bp': '이완기 혈압 (mmHg)',
    'heart_rate': '심박수 (bpm)',
    'temperature': '체온 (°C)',
    'blood_sugar': '혈당 (mg/dL)'
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
        const savedSettings = await getMainChartLegendSettings();
        
        // 저장된 설정이 있으면 병합, 없으면 기본값 사용
        if (Object.keys(savedSettings).length > 0) {
          const displaySettings = {};
          
          // 기본값을 먼저 설정
          Object.entries(DEFAULT_LEGEND_SETTINGS).forEach(([safeKey, value]) => {
            const displayKey = convertToDisplayKey(safeKey);
            displaySettings[displayKey] = value;
          });
          
          // 저장된 설정으로 덮어쓰기
          Object.entries(savedSettings).forEach(([safeKey, value]) => {
            const displayKey = convertToDisplayKey(safeKey);
            displaySettings[displayKey] = value;
          });
          
          setLegendSettings(displaySettings);
          console.log('💾 저장된 범례 설정 로드:', displaySettings);
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
      
      // 서버에 저장 (안전한 키로 변환해서 저장)
      await saveMainChartLegendSetting(displayKey, isVisible);
      console.log(`✅ 범례 설정 저장 성공: ${displayKey} = ${isVisible}`);
      
    } catch (error) {
      console.error('범례 설정 저장 실패:', error);
      
      // 저장 실패 시 이전 상태로 복구
      setLegendSettings(prev => ({
        ...prev,
        [displayKey]: !isVisible
      }));
      
      // 사용자에게 알림 (선택사항)
      alert('범례 설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return {
    legendSettings,
    setLegendSettings,
    handleLegendClick,
    loading
  };
};
