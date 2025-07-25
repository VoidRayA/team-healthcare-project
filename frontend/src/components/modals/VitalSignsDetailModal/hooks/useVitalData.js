import { useState, useEffect } from 'react';
import { getVitalSignsByDate, getVitalSigns } from '../../../../api/apiClient';
import { getLocalDateString } from '../utils/dateHelpers';
import { DEFAULT_ALERT_SETTINGS } from '../constants/vitalSettings';

export const useVitalData = (selectedSenior, selectedDate) => {
  const [loading, setLoading] = useState(false);
  const [vitalData, setVitalData] = useState([]);
  const [currentSelectedSenior, setCurrentSelectedSenior] = useState(selectedSenior);
  const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate || new Date());
  
  // 알림 설정은 localStorage에서 실시간 로드
  const [alertSettings, setAlertSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('monitoringSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.alertSettings || DEFAULT_ALERT_SETTINGS;
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    }
    return DEFAULT_ALERT_SETTINGS;
  });

  // 가장 마지막에 등록된 데이터 찾기 함수
  const findLatestData = async (seniorId) => {
    try {
      console.log('🔍 가장 최근 데이터 찾는 중...');
      
      // 방법 1: getVitalSigns API 시도
      try {
        const response = await getVitalSigns(seniorId);
        console.log('📊 getVitalSigns 응답:', response);
        
        if (response && response.length > 0) {
          const sortedData = response.sort((a, b) => 
            new Date(b.measurementTime) - new Date(a.measurementTime)
          );
          
          const latestItem = sortedData[0];
          const latestDate = new Date(latestItem.measurementTime);
          
          console.log(`✅ 방법1 성공 - 가장 최근 데이터: ${getLocalDateString(latestDate)} ${latestDate.getHours()}:${latestDate.getMinutes().toString().padStart(2, '0')}`);
          
          return {
            success: true,
            date: latestDate,
            measurementTime: latestItem.measurementTime
          };
        }
      } catch (error) {
        console.warn('❌ 방법1 실패:', error);
      }
      
      // 방법 2: 최근 30일간 역순으로 날짜별 검색
      console.log('🔄 방법2 시도: 최근 30일간 역순 검색');
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = getLocalDateString(checkDate);
        
        try {
          const data = await getVitalSignsByDate(seniorId, dateString);
          
          if (data && data.length > 0) {
            console.log(`✅ 방법2 성공 - ${dateString}에 데이터 발견! (${data.length}건)`);
            
            // 해당 날짜의 가장 최근 시간 찾기
            const sortedData = data.sort((a, b) => 
              new Date(b.measurementTime) - new Date(a.measurementTime)
            );
            
            const latestTime = new Date(sortedData[0].measurementTime);
            console.log(`📊 해당 날짜 최근 시간: ${latestTime.getHours()}:${latestTime.getMinutes().toString().padStart(2, '0')}`);
            
            return {
              success: true,
              date: checkDate,
              measurementTime: sortedData[0].measurementTime
            };
          }
        } catch (error) {
          // 개별 날짜 조회 실패는 무시하고 계속
          if (i < 5) { // 최근 5일만 로그 출력
            console.log(`❌ ${dateString}: 조회 실패 또는 데이터 없음`);
          }
        }
      }
      
      console.log('😞 최근 30일간 데이터를 찾을 수 없습니다.');
      return { success: false };
      
    } catch (error) {
      console.error('❌ 최근 데이터 조회 전체 실패:', error);
      return { success: false };
    }
  };

  // 데이터 로드
  const loadDetailData = async (seniorToLoad = currentSelectedSenior, dateToLoad = currentSelectedDate) => {
    if (!seniorToLoad?.id || !dateToLoad) return;

    try {
      setLoading(true);
      const dateString = getLocalDateString(dateToLoad);
      const data = await getVitalSignsByDate(seniorToLoad.id, dateString);
      
      setVitalData(data || []);
      
    } catch (error) {
      console.error('상세 바이탈 데이터 로드 오류:', error);
      setVitalData([]);
    } finally {
      setLoading(false);
    }
  };

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('monitoringSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.alertSettings) {
            setAlertSettings(parsed.alertSettings);
            console.log('🔄 알림 설정 실시간 업데이트:', parsed.alertSettings);
          }
        }
      } catch (error) {
        console.error('설정 업데이트 오류:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('monitoringSettingsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('monitoringSettingsChanged', handleStorageChange);
    };
  }, []);

  return {
    loading,
    vitalData,
    currentSelectedSenior,
    setCurrentSelectedSenior,
    currentSelectedDate,
    setCurrentSelectedDate,
    alertSettings,
    setAlertSettings,
    findLatestData,
    loadDetailData
  };
};
