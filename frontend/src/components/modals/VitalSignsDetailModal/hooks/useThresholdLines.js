import { useState, useEffect } from 'react';
import { getThresholdDisplaySettings, saveThresholdDisplaySetting } from '../../../../api/apiClient';
import { DEFAULT_THRESHOLD_LINES } from '../constants/vitalSettings';

export const useThresholdLines = () => {
  const [thresholdLines, setThresholdLines] = useState(DEFAULT_THRESHOLD_LINES);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const loadThresholdSettings = async () => {
      try {
        setLoading(true);
        const savedSettings = await getThresholdDisplaySettings();
        
        // 저장된 설정이 있으면 병합, 없으면 기본값 사용
        if (Object.keys(savedSettings).length > 0) {
          const mergedSettings = { ...DEFAULT_THRESHOLD_LINES };
          
          // 저장된 설정을 기본값과 병합
          Object.keys(savedSettings).forEach(key => {
            // key는 이미 깨끗한 상태 (thresholdDisplay_ 제거됨)
            if (mergedSettings.hasOwnProperty(key)) {
              mergedSettings[key] = savedSettings[key];
            }
          });
          
          setThresholdLines(mergedSettings);
          console.log('💾 저장된 기준선 설정 로드:', mergedSettings);
        } else {
          console.log('🆕 저장된 설정 없음, 기본값 사용');
        }
      } catch (error) {
        console.error('기준선 설정 로드 실패:', error);
        // 오류 시 기본값 사용
      } finally {
        setLoading(false);
      }
    };

    loadThresholdSettings();
  }, []);

  // 기준선 체크박스 변경 핸들러
  const handleThresholdLineChange = (key) => async (event) => {
    const isChecked = event.target.checked;
    
    try {
      // 즉시 UI 업데이트
      setThresholdLines(prev => ({
        ...prev,
        [key]: isChecked
      }));
      
      // 서버에 저장
      await saveThresholdDisplaySetting(key, isChecked);
      console.log(`✅ 기준선 설정 저장 성공: ${key} = ${isChecked}`);
      
    } catch (error) {
      console.error('기준선 설정 저장 실패:', error);
      
      // 저장 실패 시 이전 상태로 복구
      setThresholdLines(prev => ({
        ...prev,
        [key]: !isChecked
      }));
      
      // 사용자에게 알림 (선택사항)
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 선택된 기준선 개수 계산
  const selectedThresholdCount = Object.values(thresholdLines).filter(Boolean).length;
  const totalThresholdCount = Object.keys(thresholdLines).length;

  return {
    thresholdLines,
    setThresholdLines,
    handleThresholdLineChange,
    selectedThresholdCount,
    totalThresholdCount,
    loading
  };
};
