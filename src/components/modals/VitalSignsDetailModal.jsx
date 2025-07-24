import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Button
} from '@mui/material';
import { 
  Close as CloseIcon, 
  TrendingUp, 
  Warning, 
  CheckCircle, 
  ExpandMore,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Chart, registerables } from 'chart.js/auto';
import 'chartjs-plugin-annotation';
import { getVitalSignsByDate, getAllSeniors } from '../../api/apiClient';
import { getAuthToken as getToken } from '../../utils/auth';

// Chart.js 등록
Chart.register(...registerables);

// 로컬 시간대 기준 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const VitalSignsDetailModal = ({
  open,
  onClose,
  selectedSenior,
  selectedDate
}) => {
  // State 관리
  const [loading, setLoading] = useState(false);
  const [vitalData, setVitalData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [userSettings, setUserSettings] = useState(null);
  
  // 새로 추가: 시니어 관련 state
  const [allSeniors, setAllSeniors] = useState([]);
  const [currentSelectedSenior, setCurrentSelectedSenior] = useState(selectedSenior);
  const [seniorsLoading, setSeniorsLoading] = useState(false);

  // 알림 설정은 localStorage에서 실시간 로드
  const [alertSettings, setAlertSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('monitoringSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.alertSettings || {
          attentionRatioThreshold: 10,
          cautionRatioThreshold: 30,
          attentionCountThreshold: 3,
          cautionCountThreshold: 5,
          emergencyCountThreshold: 1,
          useRatioThreshold: true,
          useCountThreshold: true,
          useEmergencyAlert: true
        };
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
    }
    
    return {
      attentionRatioThreshold: 10,
      cautionRatioThreshold: 30,
      attentionCountThreshold: 3,
      cautionCountThreshold: 5,
      emergencyCountThreshold: 1,
      useRatioThreshold: true,
      useCountThreshold: true,
      useEmergencyAlert: true
    };
  });

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
            
            // 현재 데이터에 새 설정 적용하여 차트 갱신
            if (vitalData.length > 0) {
              setTimeout(() => {
                const result = processVitalDataFor24Hours(vitalData);
                const { processedData, lastMeasurementHour } = result;
                const statusAnalysis = analyzeVitalStatus(vitalData, parsed.alertSettings);
                
                createMainChart(processedData, lastMeasurementHour, currentSelectedSenior);
                createSummaryChart(statusAnalysis);
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error('설정 업데이트 오류:', error);
      }
    };

    // storage 이벤트 리스너 (다른 탭에서 변경 시)
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트
    window.addEventListener('monitoringSettingsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('monitoringSettingsChanged', handleStorageChange);
    };
  }, [vitalData, currentSelectedSenior]);

  // Chart refs
  const mainChartRef = useRef(null);
  const summaryChartRef = useRef(null);

  // 시니어 목록 조회 (단순화 - 첫 페이지만)
  const fetchAllSeniors = async () => {
    try {
      setSeniorsLoading(true);
      console.log('🔍 시니어 목록 조회 시작 (첫 페이지만)...');
      
      // getAllSeniors() 함수만 사용 - 추가 페이지 시도하지 않음
      const response = await getAllSeniors();
      console.log('📊 getAllSeniors 응답:', response);
      
      let seniorsList = [];
      
      if (Array.isArray(response)) {
        // 응답이 배열이면 그대로 사용
        seniorsList = response;
        console.log('✅ 배열 응답:', seniorsList.length, '개');
      } else if (response && response.content && Array.isArray(response.content)) {
        // 페이지네이션 응답이면 content만 사용
        seniorsList = response.content;
        console.log('✅ 페이지네이션 응답:', seniorsList.length, '개');
        console.log('📄 총 페이지 수:', response.totalPages || 1);
        console.log('📊 총 시니어 수:', response.totalElements || seniorsList.length);
      } else {
        console.warn('❌ 예상하지 못한 응답 형식:', response);
        seniorsList = [];
      }
      
      // 현재 선택된 시니어가 목록에 있는지 확인
      if (currentSelectedSenior && seniorsList.length > 0) {
        const foundSenior = seniorsList.find(s => s.id === currentSelectedSenior.id);
        console.log('🔎 선택된 시니어 확인:', 
          foundSenior ? `찾음 (${foundSenior.seniorName})` : `목록에 없음 (ID: ${currentSelectedSenior.id})`
        );
        
        if (!foundSenior) {
          console.log('➕ 선택된 시니어를 목록 맨 앞에 추가:', currentSelectedSenior.seniorName);
          seniorsList = [currentSelectedSenior, ...seniorsList];
        }
      } else if (currentSelectedSenior && seniorsList.length === 0) {
        // 목록이 비어있으면 선택된 시니어라도 추가
        console.log('📝 빈 목록에 선택된 시니어 추가:', currentSelectedSenior.seniorName);
        seniorsList = [currentSelectedSenior];
      }
      
      console.log('💾 최종 시니어 목록:', seniorsList.length, '개');
      
      // 기존 목록과 교체
      setAllSeniors(prevSeniors => {
        if (prevSeniors.length === 1 && prevSeniors[0]?.id === currentSelectedSenior?.id && seniorsList.length > 1) {
          // 단일 시니어에서 여러 시니어로 확장
          console.log('🔄 단일 → 다중 목록 확장');
          return seniorsList;
        } else if (seniorsList.length > 0) {
          // 새로운 목록으로 교체
          console.log('🔄 새 목록 적용');
          return seniorsList;
        } else {
          // 기존 목록 유지
          console.log('🔄 기존 목록 유지');
          return prevSeniors;
        }
      });
      
    } catch (error) {
      console.error('❌ 시니어 목록 조회 오류:', error);
      console.log('🆘 오류 발생 - 현재 선택된 시니어만 유지');
      
      // 완전 실패해도 현재 선택된 시니어는 보존
      if (currentSelectedSenior) {
        setAllSeniors([currentSelectedSenior]);
      }
    } finally {
      setSeniorsLoading(false);
    }
  };

  // 설정창의 모니터링 설정 탭으로 이동 핸들러
  const handleOpenSettings = () => {
    // 현재 모달을 닫고 모니터링 설정 탭으로 이동
    onClose();
    
    // URL에 탭 정보 포함해서 이동
    const url = '/settings?tab=1'; // tab=1은 모니터링 설정 탭
    window.location.href = url;
    
    // 또는 React Router 사용 시:
    // navigate('/settings', { state: { activeTab: 1 } });
  };
  const handleSeniorChange = async (event) => {
    const selectedSeniorId = event.target.value;
    const newSelectedSenior = allSeniors.find(senior => senior.id === selectedSeniorId);
    
    if (newSelectedSenior) {
      setCurrentSelectedSenior(newSelectedSenior);
      
      // 같은 날짜로 새로운 시니어의 데이터 로드
      try {
        setLoading(true);
        const dateString = getLocalDateString(selectedDate);
        const data = await getVitalSignsByDate(newSelectedSenior.id, dateString);
        
        setVitalData(data || []);
        
        // 차트 갱신
        setTimeout(() => {
          const result = processVitalDataFor24Hours(data);
          const { processedData, lastMeasurementHour } = result;
          const statusAnalysis = analyzeVitalStatus(data);
          
          createMainChart(processedData, lastMeasurementHour, newSelectedSenior);
          createSummaryChart(statusAnalysis);
        }, 100);
        
      } catch (error) {
        console.error('시니어 변경 시 데이터 로드 오류:', error);
        setVitalData([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // 사용자 모니터링 설정 조회
  const fetchUserSettings = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('인증 토큰이 없어 기본값을 사용합니다.');
        return;
      }

      const response = await fetch('/api/monitoring-settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setUserSettings(data);
          console.log('사용자 설정 조회 성공:', data);
        } else {
          console.warn('사용자 설정 API가 JSON이 아닌 응답을 반환했습니다. 기본값을 사용합니다.');
        }
      } else {
        console.warn('사용자 설정을 불러올 수 없어 기본값을 사용합니다.');
      }
    } catch (error) {
      console.warn('사용자 설정 조회 오류 (기본값 사용):', error.message);
    }
  };

  // 상태 분석 함수 (동적 알림 설정 적용)
  const analyzeVitalStatus = (data, customAlertSettings = null) => {
    if (!data || data.length === 0) return { status: 'no-data', message: '데이터 없음' };

    // 사용할 알림 설정 결정 (파라미터 > 현재 설정 > 기본값)
    const currentAlertSettings = customAlertSettings || alertSettings;

    let attentionCount = 0;
    let cautionCount = 0;
    let normalCount = 0;
    let emergencyCount = 0;

    // 기본값 (사용자 설정이 없을 때)
    const defaultSettings = {
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

    const settings = userSettings || defaultSettings;

    data.forEach(item => {
      let isAttention = false;
      let isCaution = false;
      let isEmergency = false;

      // 수축기 혈압 판정
      if (item.bloodPressureHigh !== null) {
        if (item.bloodPressureHigh >= 200 || item.bloodPressureHigh <= 70) {
          isEmergency = true; // 극도로 위험한 수치
        } else if (item.bloodPressureHigh >= settings.bloodPressureAttentionMax || 
            item.bloodPressureHigh <= settings.bloodPressureAttentionMin) {
          isAttention = true;
        } else if (item.bloodPressureHigh >= settings.bloodPressureCautionMax || 
                   item.bloodPressureHigh <= settings.bloodPressureCautionMin) {
          isCaution = true;
        }
      }

      // 이완기 혈압 판정
      if (item.bloodPressureLow !== null) {
        if (item.bloodPressureLow >= 130 || item.bloodPressureLow <= 40) {
          isEmergency = true; // 극도로 위험한 수치
        } else if (item.bloodPressureLow >= settings.diastolicAttentionMax || 
            item.bloodPressureLow <= settings.diastolicAttentionMin) {
          isAttention = true;
        } else if (item.bloodPressureLow >= settings.diastolicCautionMax || 
                   item.bloodPressureLow <= settings.diastolicCautionMin) {
          isCaution = true;
        }
      }

      // 심박수 판정
      if (item.heartRate !== null) {
        if (item.heartRate >= 150 || item.heartRate <= 30) {
          isEmergency = true; // 극도로 위험한 수치
        } else if (item.heartRate >= settings.heartRateAttentionMax || 
            item.heartRate <= settings.heartRateAttentionMin) {
          isAttention = true;
        } else if (item.heartRate >= settings.heartRateCautionMax || 
                   item.heartRate <= settings.heartRateCautionMin) {
          isCaution = true;
        }
      }

      // 체온 판정
      if (item.bodyTemperature !== null) {
        if (item.bodyTemperature >= 40.0 || item.bodyTemperature <= 34.0) {
          isEmergency = true; // 극도로 위험한 수치
        } else if (item.bodyTemperature >= settings.bodyTemperatureAttentionMax ||
            item.bodyTemperature <= settings.bodyTemperatureAttentionMin) {
          isAttention = true;
        } else if (item.bodyTemperature >= settings.bodyTemperatureCautionMax ||
                   item.bodyTemperature <= settings.bodyTemperatureCautionMin) {
          isCaution = true;
        }
      }

      // 혈당 판정
      if (item.bloodSugar !== null) {
        if (item.bloodSugar >= 400 || item.bloodSugar <= 40) {
          isEmergency = true; // 극도로 위험한 수치
        } else if (item.bloodSugar >= settings.bloodSugarAttentionMax ||
            item.bloodSugar <= settings.bloodSugarAttentionMin) {
          isAttention = true;
        } else if (item.bloodSugar >= settings.bloodSugarCautionMax ||
                   item.bloodSugar <= settings.bloodSugarCautionMin) {
          isCaution = true;
        }
      }

      // 카운트 증가
      if (isEmergency) {
        emergencyCount++;
      } else if (isAttention) {
        attentionCount++;
      } else if (isCaution) {
        cautionCount++;
      } else {
        normalCount++;
      }
    });

    const total = data.length;
    const attentionRatio = (attentionCount / total) * 100; // 백분율로 변환
    const cautionRatio = (cautionCount / total) * 100;

    // 동적 기준 적용
    const attentionThreshold = currentAlertSettings.attentionRatioThreshold;
    const cautionThreshold = currentAlertSettings.cautionRatioThreshold;
    const emergencyThreshold = currentAlertSettings.emergencyCountThreshold;

    console.log('📊 분석 결과:', {
      attentionRatio: attentionRatio.toFixed(1) + '%',
      cautionRatio: cautionRatio.toFixed(1) + '%',
      emergencyCount,
      thresholds: {
        attention: attentionThreshold + '%',
        caution: cautionThreshold + '%',
        emergency: emergencyThreshold + '회'
      }
    });

    // 즉시 알림 (응급 상황)
    if (currentAlertSettings.useEmergencyAlert && emergencyCount >= emergencyThreshold) {
      return { 
        status: 'emergency', 
        message: '⚡ 즉시 확인 필요',
        counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    }
    
    // 의료진 상담 권장
    if (currentAlertSettings.useRatioThreshold && attentionRatio >= attentionThreshold) {
      return { 
        status: 'attention', 
        message: `의료진 상담 권장 (${attentionRatio.toFixed(1)}%)`,
        counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    }
    
    // 횟수 기준으로도 체크
    if (currentAlertSettings.useCountThreshold && attentionCount >= currentAlertSettings.attentionCountThreshold) {
      return { 
        status: 'attention', 
        message: `의료진 상담 권장 (${attentionCount}회)`,
        counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    }
    
    // 계속 관찰 필요
    if ((currentAlertSettings.useRatioThreshold && cautionRatio >= cautionThreshold) ||
        (currentAlertSettings.useCountThreshold && cautionCount >= currentAlertSettings.cautionCountThreshold) ||
        attentionCount > 0) {
      return { 
        status: 'caution', 
        message: `계속 관찰 필요 (${cautionRatio.toFixed(1)}%)`,
        counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    }

    return { 
      status: 'normal', 
      message: '안정적 상태',
      counts: { emergency: emergencyCount, attention: attentionCount, caution: cautionCount, normal: normalCount }
    };
  };

  // 24시간 기준 데이터 처리 함수
  const processVitalDataFor24Hours = (rawData) => {
    // 24시간 전체 시간대 생성 (00:00 ~ 23:00)
    const allHours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return {
        time: `${hour}:00`,
        hour: i,
        hasData: false,
        bloodPressureHigh: null,
        bloodPressureLow: null,
        heartRate: null,
        bodyTemperature: null,
        bloodSugar: null,
        dataCount: 0
      };
    });

    if (!rawData || rawData.length === 0) {
      return {
        processedData: allHours,
        lastMeasurementHour: -1
      };
    }

    // 실제 데이터를 시간대별로 그룹화
    const hourlyData = {};
    let lastMeasurementHour = -1;

    rawData.forEach(item => {
      const time = new Date(item.measurementTime);
      const hour = time.getHours();
      lastMeasurementHour = Math.max(lastMeasurementHour, hour);
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(item);
    });

    // 실제 데이터가 있는 시간대에 평균값 계산
    Object.keys(hourlyData).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const items = hourlyData[hour];
      
      allHours[hour] = {
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour,
        hasData: true,
        bloodPressureHigh: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureHigh || 0), 0) / items.length),
        bloodPressureLow: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureLow || 0), 0) / items.length),
        heartRate: Math.round(items.reduce((sum, item) => sum + (item.heartRate || 0), 0) / items.length),
        bodyTemperature: Number((items.reduce((sum, item) => sum + (item.bodyTemperature || 0), 0) / items.length).toFixed(1)),
        bloodSugar: Math.round(items.reduce((sum, item) => sum + (item.bloodSugar || 0), 0) / items.length),
        dataCount: items.length
      };
    });

    console.log(`🕰️ 24시간 처리 완료: 마지막 측정 ${lastMeasurementHour}:00`);
    
    return {
      processedData: allHours,
      lastMeasurementHour: lastMeasurementHour
    };
  };

  // 메인 차트 생성 (24시간 기준 + 사용자 설정 기준선)
  const createMainChart = (processedData, lastMeasurementHour, seniorInfo = currentSelectedSenior) => {
    if (!mainChartRef.current) return;

    const ctx = mainChartRef.current.getContext('2d');
    
    // 기존 차트 제거
    const existingChart = Chart.getChart(mainChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    // 실제 데이터가 있는 부분과 빈 부분 분리
    const actualData = processedData.filter(item => item.hasData);
    const allLabels = processedData.map(item => item.time);
    
    // 데이터셋 생성
    const datasets = [];
    
    if (actualData.length > 0) {
      // 실제 데이터 라인 (전체 24시간 기준으로)
      const bloodPressureHighData = processedData.map(item => item.hasData ? item.bloodPressureHigh : null);
      const bloodPressureLowData = processedData.map(item => item.hasData ? item.bloodPressureLow : null);
      const heartRateData = processedData.map(item => item.hasData ? item.heartRate : null);
      const temperatureData = processedData.map(item => item.hasData ? item.bodyTemperature : null);
      
      datasets.push(
        {
          label: '수축기 혈압 (mmHg)',
          data: bloodPressureHighData,
          borderColor: '#ff4444',
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'blood-pressure',
          spanGaps: false // null 값에서 라인 끊김
        },
        {
          label: '이완기 혈압 (mmHg)',
          data: bloodPressureLowData,
          borderColor: '#ff7777',
          backgroundColor: 'rgba(255, 119, 119, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          yAxisID: 'blood-pressure',
          spanGaps: false
        },
        {
          label: '심박수 (bpm)',
          data: heartRateData,
          borderColor: '#4dabf7',
          backgroundColor: 'rgba(77, 171, 247, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'heart-rate',
          spanGaps: false
        },
        {
          label: '체온 (°C)',
          data: temperatureData,
          borderColor: '#69db7c',
          backgroundColor: 'rgba(105, 219, 124, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'temperature',
          spanGaps: false
        }
      );
    }

    // 사용자 설정 기반 기준선 추가
    const defaultSettings = {
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
      bodyTemperatureCautionMin: 36.0
    };

    const settings = userSettings || defaultSettings;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${seniorInfo?.seniorName || '보호 대상자'}님의 24시간 바이탈 사인 ${lastMeasurementHour >= 0 ? `(마지막 측정: ${lastMeasurementHour}:00)` : ''}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          tooltip: {
            filter: function(tooltipItem) {
              // 데이터가 있는 경우만 툴팁 표시
              const dataIndex = tooltipItem.dataIndex;
              return processedData[dataIndex].hasData;
            },
            callbacks: {
              title: function(context) {
                const dataIndex = context[0].dataIndex;
                const data = processedData[dataIndex];
                return data.hasData ? `${context[0].label} (${data.dataCount}건 측정)` : '데이터 없음';
              }
            }
          },
          // 기준선 표시를 위한 annotation 플러그인
          annotation: {
            annotations: {
              // 혈압 위험 기준선 (상한)
              bpAttentionMax: {
                type: 'line',
                yMin: settings.bloodPressureAttentionMax,
                yMax: settings.bloodPressureAttentionMax,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: `위험: ${settings.bloodPressureAttentionMax}`,
                  enabled: true,
                  position: 'end'
                },
                scaleID: 'blood-pressure'
              },
              // 혈압 위험 기준선 (하한)
              bpAttentionMin: {
                type: 'line',
                yMin: settings.bloodPressureAttentionMin,
                yMax: settings.bloodPressureAttentionMin,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: `위험: ${settings.bloodPressureAttentionMin}`,
                  enabled: true,
                  position: 'start'
                },
                scaleID: 'blood-pressure'
              },
              // 혈압 주의 기준선 (상한)
              bpCautionMax: {
                type: 'line',
                yMin: settings.bloodPressureCautionMax,
                yMax: settings.bloodPressureCautionMax,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                label: {
                  content: `주의: ${settings.bloodPressureCautionMax}`,
                  enabled: true,
                  position: 'end'
                },
                scaleID: 'blood-pressure'
              },
              // 혈압 주의 기준선 (하한)
              bpCautionMin: {
                type: 'line',
                yMin: settings.bloodPressureCautionMin,
                yMax: settings.bloodPressureCautionMin,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                label: {
                  content: `주의: ${settings.bloodPressureCautionMin}`,
                  enabled: true,
                  position: 'start'
                },
                scaleID: 'blood-pressure'
              },
              // 심박수 위험 기준선
              hrAttentionMax: {
                type: 'line',
                yMin: settings.heartRateAttentionMax,
                yMax: settings.heartRateAttentionMax,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                scaleID: 'heart-rate'
              },
              hrAttentionMin: {
                type: 'line',
                yMin: settings.heartRateAttentionMin,
                yMax: settings.heartRateAttentionMin,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                scaleID: 'heart-rate'
              },
              // 심박수 주의 기준선
              hrCautionMax: {
                type: 'line',
                yMin: settings.heartRateCautionMax,
                yMax: settings.heartRateCautionMax,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                scaleID: 'heart-rate'
              },
              hrCautionMin: {
                type: 'line',
                yMin: settings.heartRateCautionMin,
                yMax: settings.heartRateCautionMin,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                scaleID: 'heart-rate'
              },
              // 체온 위험 기준선
              tempAttentionMax: {
                type: 'line',
                yMin: settings.bodyTemperatureAttentionMax,
                yMax: settings.bodyTemperatureAttentionMax,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                scaleID: 'temperature'
              },
              tempAttentionMin: {
                type: 'line',
                yMin: settings.bodyTemperatureAttentionMin,
                yMax: settings.bodyTemperatureAttentionMin,
                borderColor: '#ff4444',
                borderWidth: 2,
                borderDash: [5, 5],
                scaleID: 'temperature'
              },
              // 체온 주의 기준선
              tempCautionMax: {
                type: 'line',
                yMin: settings.bodyTemperatureCautionMax,
                yMax: settings.bodyTemperatureCautionMax,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                scaleID: 'temperature'
              },
              tempCautionMin: {
                type: 'line',
                yMin: settings.bodyTemperatureCautionMin,
                yMax: settings.bodyTemperatureCautionMin,
                borderColor: '#ff9800',
                borderWidth: 1,
                borderDash: [3, 3],
                scaleID: 'temperature'
              }
            }
          }
        },
        scales: {
          'blood-pressure': {
            type: 'linear',
            position: 'left',
            title: { display: true, text: '혈압 (mmHg)', color: '#ff4444' },
            min: 60,
            max: 200,
            grid: { color: 'rgba(255, 68, 68, 0.1)' }
          },
          'heart-rate': {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '심박수 (bpm)', color: '#4dabf7' },
            min: 50,
            max: 120,
            grid: { display: false }
          },
          'temperature': {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '체온 (°C)', color: '#69db7c' },
            min: 35,
            max: 40,
            grid: { display: false }
          },
          x: {
            title: { display: true, text: '시간 (24시간 기준)' },
            grid: {
              color: function(context) {
                const hour = context.tick.value;
                // 데이터가 있는 구간은 진한 선, 없는 구간은 연한 점선
                return hour <= lastMeasurementHour ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)';
              }
            },
            ticks: {
              color: function(context) {
                const hour = context.tick.value;
                // 데이터가 있는 구간은 진한 색, 없는 구간은 연한 색
                return hour <= lastMeasurementHour ? '#333' : '#ccc';
              }
            }
          }
        }
      }
    });

    setChartInstances(prev => ({ ...prev, mainChart: chart }));
  };

  // 상태 요약 차트 생성 (도넛 차트)
  const createSummaryChart = (statusAnalysis) => {
    if (!summaryChartRef.current || !statusAnalysis.counts) return;

    const ctx = summaryChartRef.current.getContext('2d');
    
    // 기존 차트 제거
    const existingChart = Chart.getChart(summaryChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    const { attention, caution, normal } = statusAnalysis.counts;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['주의', '관찰', '안정'],
        datasets: [{
          data: [attention, caution, normal],
          backgroundColor: ['#ff9800', '#ffc107', '#4caf50'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '측정값 분포',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    setChartInstances(prev => ({ ...prev, summaryChart: chart }));
  };

  // 데이터 로드
  const loadDetailData = async (seniorToLoad = currentSelectedSenior) => {
    if (!seniorToLoad?.id || !selectedDate) return;

    try {
      setLoading(true);
      const dateString = getLocalDateString(selectedDate);
      const data = await getVitalSignsByDate(seniorToLoad.id, dateString);
      
      setVitalData(data || []);
      
      // 차트 생성
      setTimeout(() => {
        const result = processVitalDataFor24Hours(data);
        const { processedData, lastMeasurementHour } = result;
        const statusAnalysis = analyzeVitalStatus(data);
        
        createMainChart(processedData, lastMeasurementHour, seniorToLoad);
        createSummaryChart(statusAnalysis);
      }, 100);
      
    } catch (error) {
      console.error('상세 바이탈 데이터 로드 오류:', error);
      setVitalData([]);
    } finally {
      setLoading(false);
    }
  };

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (open && selectedSenior) {
      console.log('🚀 모달 열림 - selectedSenior:', selectedSenior);
      
      // 선택된 시니어 즉시 설정
      setCurrentSelectedSenior(selectedSenior);
      
      // 일단 현재 선택된 시니어만으로 목록 초기화 (즉시 표시용)
      setAllSeniors([selectedSenior]);
      
      // 최신 알림 설정 로드
      try {
        const saved = localStorage.getItem('monitoringSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.alertSettings) {
            setAlertSettings(parsed.alertSettings);
            console.log('🔄 모달 열기 시 알림 설정 로드:', parsed.alertSettings);
          }
        }
      } catch (error) {
        console.error('설정 로드 오류:', error);
      }
      
      // 사용자 설정 조회
      fetchUserSettings();
      
      // 바이탈 데이터 로드
      loadDetailData(selectedSenior);
      
      // 전체 시니어 목록은 백그라운드에서 로드
      setTimeout(() => {
        fetchAllSeniors();
      }, 100);
      
    } else if (!open) {
      // 모달이 닫힐 때 상태 초기화
      setCurrentSelectedSenior(null);
      setAllSeniors([]);
      setVitalData([]);
    }
  }, [open, selectedSenior, selectedDate]);

  // 차트 정리
  useEffect(() => {
    return () => {
      Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  const statusAnalysis = analyzeVitalStatus(vitalData);
  const result = processVitalDataFor24Hours(vitalData);
  const { processedData } = result;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        height: '80px' // 고정 높이
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" component="div" fontWeight="bold">
            💓 바이탈 사인 상세 분석
          </Typography>
          
          {/* 새로 추가: 시니어 선택 드롭다운 + 날짜 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>👤</Typography>
            
            {/* 시니어 선택 드롭다운 */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={currentSelectedSenior?.id || ''}
                onChange={handleSeniorChange}
                disabled={seniorsLoading || !Array.isArray(allSeniors) || allSeniors.length === 0}
                displayEmpty
                IconComponent={ExpandMore}
                sx={{
                  '& .MuiSelect-select': {
                    py: 0.5,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2'
                  }
                }}
              >
                {/* 디버깅 정보 표시 */}
                {!Array.isArray(allSeniors) && (
                  <MenuItem disabled>
                    <Typography sx={{ color: 'red', fontSize: '0.8rem' }}>
                      DEBUG: allSeniors is not array: {typeof allSeniors}
                    </Typography>
                  </MenuItem>
                )}
                
                {Array.isArray(allSeniors) && allSeniors.length === 0 && (
                  <MenuItem disabled>
                    <Typography sx={{ color: 'orange', fontSize: '0.8rem' }}>
                      DEBUG: allSeniors is empty array (loading: {seniorsLoading ? 'true' : 'false'})
                    </Typography>
                  </MenuItem>
                )}

                {!currentSelectedSenior && Array.isArray(allSeniors) && allSeniors.length > 0 && (
                  <MenuItem value="" disabled>
                    <Typography sx={{ color: 'text.secondary' }}>
                      시니어를 선택하세요
                    </Typography>
                  </MenuItem>
                )}
                
                {(Array.isArray(allSeniors) && allSeniors.length > 0) ? (
                  allSeniors.map((senior) => (
                    <MenuItem key={senior.id} value={senior.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {senior.seniorName}님
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          (ID: {senior.id})
                        </Typography>
                        {senior.age && (
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                            ({senior.age}세)
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))
                ) : seniorsLoading ? (
                  <MenuItem disabled>
                    <Typography sx={{ color: 'text.secondary' }}>
                      로딩 중...
                    </Typography>
                  </MenuItem>
                ) : null}
              </Select>
            </FormControl>
            
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>•</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>📅</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#1976d2', fontWeight: 'bold' }}>
              {getLocalDateString(selectedDate)}
            </Typography>
          </Box>
        </Box>
        
        {/* 상태 표시 + 설정 버튼 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={
              statusAnalysis.status === 'emergency' ? <Warning sx={{ color: '#fff' }} /> :
              statusAnalysis.status === 'attention' ? <Warning /> :
              statusAnalysis.status === 'caution' ? <TrendingUp /> :
              <CheckCircle />
            }
            label={statusAnalysis.message}
            color={
              statusAnalysis.status === 'emergency' ? 'error' :
              statusAnalysis.status === 'attention' ? 'warning' :
              statusAnalysis.status === 'caution' ? 'info' :
              'success'
            }
            variant="filled"
            sx={{ 
              fontSize: statusAnalysis.status === 'emergency' ? '1.1rem' : '1rem',
              fontWeight: statusAnalysis.status === 'emergency' ? 'bold' : 'normal'
            }}
          />
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
            sx={{ 
              fontSize: '0.8rem',
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#1976d2',
                color: '#1976d2'
              }
            }}
          >
            알림 설정
          </Button>
          
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, height: 'calc(90vh - 120px)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={60} />
            <Typography sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 상단: 메인 차트 (70% 높이) */}
            <Box sx={{ height: '70%', mb: 2 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <canvas ref={mainChartRef} style={{ width: '100%', height: '100%' }} />
              </Paper>
            </Box>

            {/* 하단: 요약 정보들 (30% 높이) */}
            <Box sx={{ height: '30%', display: 'flex', gap: 2 }}>
              {/* 왼쪽: 상태 도넛 차트 */}
              <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>📊 측정 분포</Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <canvas ref={summaryChartRef} style={{ width: '100%', height: '100%' }} />
                </Box>
              </Paper>

              {/* 가운데: 통계 정보 - 작은 카드 스타일 */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>📈 측정 통계</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  height: 'calc(100% - 30px)',
                  justifyContent: 'center'
                }}>
                  {/* 작은 카드 스타일 */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 1,
                    overflow: 'hidden'
                  }}>
                    {/* 총 측정 */}
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 1.5,
                      backgroundColor: '#f5f5f5'
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        총
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                        {vitalData.length}
                      </Typography>
                    </Box>
                    
                    {statusAnalysis.counts && (
                      <>
                        {/* 위험 */}
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          backgroundColor: '#ffebee'
                        }}>
                          <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem' }}>
                            위험
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="error" sx={{ fontSize: '1.1rem' }}>
                            {statusAnalysis.counts.attention}
                          </Typography>
                        </Box>
                        
                        {/* 주의 */}
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          backgroundColor: '#fff3e0'
                        }}>
                          <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.7rem' }}>
                            주의
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.1rem' }}>
                            {statusAnalysis.counts.caution}
                          </Typography>
                        </Box>
                        
                        {/* 정상 */}
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          backgroundColor: '#e8f5e8'
                        }}>
                          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                            정상
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                            {statusAnalysis.counts.normal}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Paper>

              {/* 오른쪽: 권장사항 */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>💡 권장사항</Typography>
                <Box sx={{ 
                  height: 'calc(100% - 30px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {statusAnalysis.status === 'attention' 
                      ? '⚠️ 수치를 확인해주세요. 의료진과 상담을 권장합니다.'
                      : statusAnalysis.status === 'caution'
                      ? '📈 일부 수치를 계속 관찰해주세요. 규칙적인 측정을 추천합니다.'
                      : '✅ 대부분 안정적인 상태입니다. 현재 관리 방법을 유지하세요.'
                    }
                  </Typography>
                  
                  {processedData.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        시간대: {processedData.length}개 구간 측정
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VitalSignsDetailModal;