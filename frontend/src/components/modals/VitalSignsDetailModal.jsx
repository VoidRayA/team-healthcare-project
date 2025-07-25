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
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { Chart, registerables } from 'chart.js/auto';
import { Chart as ChartJS } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// 컴포넌트들
import EmptyDataView from './VitalSignsDetailModal/components/EmptyDataView';
import ThresholdMenu from './VitalSignsDetailModal/components/ThresholdMenu';
import DetailAnalysis from './VitalSignsDetailModal/components/DetailAnalysis';
import MeasurementStats from './VitalSignsDetailModal/components/MeasurementStats';

// 훅들
import { useVitalData } from './VitalSignsDetailModal/hooks/useVitalData';
import { useThresholdLines } from './VitalSignsDetailModal/hooks/useThresholdLines';
import { useLegendSettings } from './VitalSignsDetailModal/hooks/useLegendSettings';

// 유틸들
import { processVitalDataFor24Hours, getLocalDateString } from './VitalSignsDetailModal/utils/dateHelpers';
import { analyzeVitalStatus } from './VitalSignsDetailModal/utils/vitalAnalysis';
import { createThresholdAnnotations, createChartDatasets } from './VitalSignsDetailModal/utils/chartHelpers';
import { DEFAULT_VITAL_SETTINGS } from './VitalSignsDetailModal/constants/vitalSettings';

// API
import { getAllSeniors, getSeniorsWithPagination, getVitalSettings } from '../../api/apiClient';
import { getAuthToken as getToken } from '../../utils/auth';

// Chart.js 등록
ChartJS.register(...registerables, annotationPlugin);

const VitalSignsDetailModal = ({
  open,
  onClose,
  selectedSenior,
  selectedDate
}) => {
  // 커스텀 훅들
  const {
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
  } = useVitalData(selectedSenior, selectedDate);

  const {
    thresholdLines,
    setThresholdLines,
    handleThresholdLineChange,
    selectedThresholdCount,
    totalThresholdCount,
    loading: thresholdLoading
  } = useThresholdLines();

  const {
    legendSettings: visibleDatasets,
    setLegendSettings: setVisibleDatasets,
    handleLegendClick: handleLegendSettingChange,
    loading: legendLoading
  } = useLegendSettings();

  // 로컬 state
  const [chartInstances, setChartInstances] = useState({});
  const [userSettings, setUserSettings] = useState(null);
  const [allSeniors, setAllSeniors] = useState([]);
  const [seniorsLoading, setSeniorsLoading] = useState(false);

  // Chart refs
  const mainChartRef = useRef(null);
  const summaryChartRef = useRef(null);

  // 설정창 이동 핸들러
  const handleOpenSettings = () => {
    onClose();
    const url = '/settings?tab=1';
    window.location.href = url;
  };

  // 🎯 간단한 커스텀 범례 클릭 핸들러
  // 🎯 범례 클릭 핸들러 (측정분포 연동 + 서버 저장) - 안전한 처리
  const handleLegendClick = (event, legendItem, legend) => {
    console.log('🔄 범례 클릭 시작:', legendItem);
    
    // ❗ Chart.js 기본 동작을 안전하게 차단
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    
    const chart = legend.chart;
    const datasetIndex = legendItem.datasetIndex;
    const datasetLabel = chart.data.datasets[datasetIndex].label;
    
    console.log('🔍 Chart info:', {
      datasetIndex,
      datasetLabel,
      totalDatasets: chart.data.datasets.length
    });
    
    // 현재 상태 확인
    const isCurrentlyVisible = chart.isDatasetVisible(datasetIndex);
    
    console.log('🔍 현재 상태:', { 
      isCurrentlyVisible,
      datasetLabel
    });
    
    // 상태 전환
    if (isCurrentlyVisible) {
      chart.hide(datasetIndex);
      console.log(`👁️ ${datasetLabel} 숨김`);
    } else {
      chart.show(datasetIndex);
      console.log(`👁️ ${datasetLabel} 표시`);
    }
    
    const newVisibility = chart.isDatasetVisible(datasetIndex);
    
    console.log('🔍 상태 전환 완룼:', { 
      before: isCurrentlyVisible,
      after: newVisibility,
      datasetLabel
    });
    
    // 서버에 저장
    handleLegendSettingChange(datasetLabel, newVisibility);
    
    console.log('📊 범례 클릭 결과:', datasetLabel, '상태:', newVisibility);
    
    // 기본 동작 완전 차단
    return false;
  };

  // 사용자 설정 조회 (바이탈 설정 포함)
  const fetchUserSettings = async () => {
    try {
      // 1. 기존 모니터링 설정 조회
      const token = getToken();
      if (token) {
        try {
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
              const monitoringData = await response.json();
              console.log('모니터링 설정 조회 성공:', monitoringData);
            }
          }
        } catch (error) {
          console.warn('모니터링 설정 조회 실패:', error.message);
        }
      }

      // 2. 바이탈 사인 설정 조회 (새로 추가)
      try {
        // 바이탈 설정 API가 아직 구현되지 않아서 주석 처리
        // const vitalConfig = await getVitalSettings();
        // console.log('🩺 바이탈 설정 조회 성공:', vitalConfig);
        
        // 임시로 기본값 사용
        setUserSettings(prevSettings => ({
          ...prevSettings,
          ...DEFAULT_VITAL_SETTINGS
        }));
        
      } catch (error) {
        console.warn('바이탈 설정 조회 실패 (기본값 사용):', error.message);
        
        // 기본값 설정
        setUserSettings(prevSettings => ({
          ...prevSettings,
          ...DEFAULT_VITAL_SETTINGS
        }));
      }
      
    } catch (error) {
      console.error('사용자 설정 조회 전체 오류:', error);
    }
  };

  // 🎯 측정분포 계산 함수 (항목별 분석 데이터 합산)
  const calculateAggregatedDistribution = (statusAnalysis) => {
    if (!statusAnalysis.details) {
      return { emergency: 0, attention: 0, caution: 0, normal: 0 };
    }
    
    const totals = { emergency: 0, attention: 0, caution: 0, normal: 0 };
    
    // 각 바이탈 사인별로 표시 상태 확인하고 합산
    const vitalMapping = {
      '수축기 혈압 (mmHg)': 'bloodPressure',
      '이완기 혈압 (mmHg)': 'bloodPressure', // 수축기와 동일한 데이터 사용
      '심박수 (bpm)': 'heartRate',
      '체온 (°C)': 'temperature',
      '혈당 (mg/dL)': 'bloodSugar'
    };
    
    // 표시된 항목들만 합산 (중복 제거를 위해 Set 사용)
    const includedCategories = new Set();
    
    Object.entries(visibleDatasets).forEach(([datasetLabel, isVisible]) => {
      if (isVisible && vitalMapping[datasetLabel]) {
        const category = vitalMapping[datasetLabel];
        includedCategories.add(category);
      }
    });
    
    // 혈당은 항상 포함 (차트에 표시되지 않지만 분석에는 포함)
    includedCategories.add('bloodSugar');
    
    console.log('📊 합산 대상 카테고리:', Array.from(includedCategories));
    
    // 선택된 카테고리들의 데이터 합산
    includedCategories.forEach(category => {
      if (statusAnalysis.details[category]) {
        totals.emergency += statusAnalysis.details[category].emergency || 0;
        totals.attention += statusAnalysis.details[category].attention || 0;
        totals.caution += statusAnalysis.details[category].caution || 0;
        totals.normal += statusAnalysis.details[category].normal || 0;
      }
    });
    
    console.log('🎯 집계된 측정분포:', totals);
    return totals;
  };

  // 메인 차트 생성
  const createMainChart = (processedData, lastMeasurementHour, seniorInfo = currentSelectedSenior) => {
    if (!mainChartRef.current) {
      console.warn('메인 차트 ref가 없음');
      return;
    }

    const ctx = mainChartRef.current.getContext('2d');
    
    // 기존 차트 파기
    const existingChart = Chart.getChart(mainChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    // DOM 요소가 여전히 연결되어 있는지 확인
    if (!mainChartRef.current.parentNode) {
      console.warn('메인 차트 DOM 요소가 연결되지 않음');
      return;
    }

    const allLabels = processedData.map(item => item.time);
    const datasets = createChartDatasets(processedData);

    // 기준선 annotation 생성
    const getSettingValue = (key, defaultValue) => {
      if (userSettings && userSettings[key]) {
        const value = parseFloat(userSettings[key]);
        return isNaN(value) ? defaultValue : value;
      }
      return defaultValue;
    };

    const settings = {
      bloodPressureAttentionMax: getSettingValue('bloodPressureAttentionMax', DEFAULT_VITAL_SETTINGS.bloodPressureAttentionMax),
      bloodPressureAttentionMin: getSettingValue('bloodPressureAttentionMin', DEFAULT_VITAL_SETTINGS.bloodPressureAttentionMin),
      bloodPressureCautionMax: getSettingValue('bloodPressureCautionMax', DEFAULT_VITAL_SETTINGS.bloodPressureCautionMax),
      bloodPressureCautionMin: getSettingValue('bloodPressureCautionMin', DEFAULT_VITAL_SETTINGS.bloodPressureCautionMin),
      diastolicAttentionMax: getSettingValue('diastolicAttentionMax', DEFAULT_VITAL_SETTINGS.diastolicAttentionMax),
      diastolicAttentionMin: getSettingValue('diastolicAttentionMin', DEFAULT_VITAL_SETTINGS.diastolicAttentionMin),
      diastolicCautionMax: getSettingValue('diastolicCautionMax', DEFAULT_VITAL_SETTINGS.diastolicCautionMax),
      diastolicCautionMin: getSettingValue('diastolicCautionMin', DEFAULT_VITAL_SETTINGS.diastolicCautionMin),
      heartRateAttentionMax: getSettingValue('heartRateAttentionMax', DEFAULT_VITAL_SETTINGS.heartRateAttentionMax),
      heartRateAttentionMin: getSettingValue('heartRateAttentionMin', DEFAULT_VITAL_SETTINGS.heartRateAttentionMin),
      heartRateCautionMax: getSettingValue('heartRateCautionMax', DEFAULT_VITAL_SETTINGS.heartRateCautionMax),
      heartRateCautionMin: getSettingValue('heartRateCautionMin', DEFAULT_VITAL_SETTINGS.heartRateCautionMin),
      bodyTemperatureAttentionMax: getSettingValue('bodyTemperatureAttentionMax', DEFAULT_VITAL_SETTINGS.bodyTemperatureAttentionMax),
      bodyTemperatureAttentionMin: getSettingValue('bodyTemperatureAttentionMin', DEFAULT_VITAL_SETTINGS.bodyTemperatureAttentionMin),
      bodyTemperatureCautionMax: getSettingValue('bodyTemperatureCautionMax', DEFAULT_VITAL_SETTINGS.bodyTemperatureCautionMax),
      bodyTemperatureCautionMin: getSettingValue('bodyTemperatureCautionMin', DEFAULT_VITAL_SETTINGS.bodyTemperatureCautionMin),
      bloodSugarAttentionMax: getSettingValue('bloodSugarAttentionMax', DEFAULT_VITAL_SETTINGS.bloodSugarAttentionMax),
      bloodSugarAttentionMin: getSettingValue('bloodSugarAttentionMin', DEFAULT_VITAL_SETTINGS.bloodSugarAttentionMin),
      bloodSugarCautionMax: getSettingValue('bloodSugarCautionMax', DEFAULT_VITAL_SETTINGS.bloodSugarCautionMax),
      bloodSugarCautionMin: getSettingValue('bloodSugarCautionMin', DEFAULT_VITAL_SETTINGS.bloodSugarCautionMin)
    };

    const thresholdAnnotations = createThresholdAnnotations(settings, thresholdLines);
    
    console.log('📊 생성된 기준선 annotation:', thresholdAnnotations);
    console.log('📊 사용자 설정:', userSettings);
    console.log('📊 기준선 체크 상태:', thresholdLines);

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
            labels: { usePointStyle: true, padding: 20 },
            onClick: handleLegendClick  // 🎯 범례 클릭 핸들러 추가
          },
          tooltip: {
            filter: function(tooltipItem) {
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
          annotation: {
            annotations: thresholdAnnotations
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
          'blood-sugar': {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '혈당 (mg/dL)', color: '#9c27b0' },
            min: 50,
            max: 300,
            grid: { display: false }
          },
          x: {
            title: { display: true, text: '시간 (24시간 기준)' },
            grid: {
              color: function(context) {
                const hour = context.tick.value;
                return hour <= lastMeasurementHour ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)';
              }
            },
            ticks: {
              color: function(context) {
                const hour = context.tick.value;
                return hour <= lastMeasurementHour ? '#333' : '#ccc';
              }
            }
          }
        }
      }
    });

    // 차트 인스턴스 저장 (안전하게)
    setChartInstances(prev => ({ ...prev, mainChart: chart }));
    
    // 차트 준비 완료 표시
    console.log('🎉 차트 생성 완룉!');
    
    // 🎯 저장된 범례 설정 적용 (더 안전한 방식)
    setTimeout(() => {
      try {
        // DOM 요소가 여전히 존재하는지 확인
        if (!chart.canvas || !chart.canvas.parentNode) {
          console.warn('😨 차트 DOM 요소가 제거됨 - 범례 설정 적용 중단');
          return;
        }
        
        // 차트가 아직 유효한지 확인
        if (chart.destroyed) {
          console.warn('😨 차트가 이미 파기됨 - 범례 설정 적용 중단');
          return;
        }
        
        // 범례 설정 적용
        chart.data.datasets.forEach((dataset, index) => {
          const isVisible = visibleDatasets[dataset.label];
          if (isVisible === false) {
            chart.getDatasetMeta(index).hidden = true;
            console.log('👁️ 저장된 설정 적용:', dataset.label, '숨김');
          }
        });
        
        // DOM 요소가 여전히 존재하는 경우에만 업데이트
        if (chart.canvas && chart.canvas.parentNode && !chart.destroyed) {
          chart.update('none'); // 애니메이션 없이 업데이트
          console.log('🎯 저장된 범례 설정 적용 완료');
        }
      } catch (error) {
        console.warn('😨 범례 설정 적용 중 오류:', error);
      }
    }, 150); // 시간을 좀 더 여유롭게
  };

  // 요약 차트 생성 (🎯 항목별 분석 데이터 합산 사용)
  const createSummaryChart = (statusAnalysis) => {
    if (!summaryChartRef.current) {
      console.warn('요약 차트 ref가 없음');
      return;
    }

    const ctx = summaryChartRef.current.getContext('2d');
    
    // 기존 차트 파기
    const existingChart = Chart.getChart(summaryChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    // DOM 요소가 여전히 연결되어 있는지 확인
    if (!summaryChartRef.current.parentNode) {
      console.warn('요약 차트 DOM 요소가 연결되지 않음');
      return;
    }

    // 🎯 항목별 분석 데이터를 합산한 분포 사용
    const aggregatedData = calculateAggregatedDistribution(statusAnalysis);
    
    const { emergency, attention, caution, normal } = aggregatedData;
    const total = emergency + attention + caution + normal;
    
    // 데이터가 없는 경우 처리
    if (total === 0) {
      console.log('📊 측정분포 데이터 없음');
      return;
    }

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: emergency > 0 ? ['응급', '주의', '관찰', '안정'] : ['주의', '관찰', '안정'],
        datasets: [{
          data: emergency > 0 ? [emergency, attention, caution, normal] : [attention, caution, normal],
          backgroundColor: emergency > 0 ? 
            ['#f44336', '#ff9800', '#2196f3', '#4caf50'] : 
            ['#ff9800', '#2196f3', '#4caf50'], // 🎨 관찰: #ffc107 → #2196f3 (파란색)으로 변경
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 11,
                weight: '500'
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const backgroundColor = data.datasets[0].backgroundColor[i];
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return {
                      text: `${label} (${value}) ${percentage}%`,
                      fillStyle: backgroundColor,
                      strokeStyle: backgroundColor,
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value}건 (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });

    setChartInstances(prev => ({ ...prev, summaryChart: chart }));
  };

  // 시니어 변경 핸들러
  const handleSeniorChange = async (event) => {
    const selectedSeniorId = event.target.value;
    const newSelectedSenior = allSeniors.find(senior => senior.id === selectedSeniorId);
    
    if (newSelectedSenior) {
      setCurrentSelectedSenior(newSelectedSenior);
      await loadDetailData(newSelectedSenior, currentSelectedDate);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = async (newDate) => {
    if (!newDate || !currentSelectedSenior) return;
    
    setCurrentSelectedDate(newDate);
    await loadDetailData(currentSelectedSenior, newDate);
  };

  // 시니어 목록 조회
  const fetchAllSeniors = async () => {
    try {
      setSeniorsLoading(true);
      console.log('🔍 시니어 목록 조회 시작...');
      
      let seniorsList = [];
      try {
        const response = await getAllSeniors();
        console.log('📊 getAllSeniors 응답:', response);
        
        if (Array.isArray(response)) {
          seniorsList = response;
          console.log('✅ 배열 응답:', seniorsList.length, '개');
        } else if (response && response.content && Array.isArray(response.content)) {
          seniorsList = response.content;
          console.log('✅ 페이지네이션 응답:', seniorsList.length, '개');
        }
      } catch (error) {
        console.warn('❌ getAllSeniors 실패:', error);
      }
      
      // 현재 선택된 시니어가 목록에 있는지 확인
      if (currentSelectedSenior && seniorsList.length > 0) {
        const foundSenior = seniorsList.find(s => s.id === currentSelectedSenior.id);
        
        if (!foundSenior) {
          console.log('➕ 선택된 시니어를 목록 맨 앞에 추가:', currentSelectedSenior.seniorName);
          seniorsList = [currentSelectedSenior, ...seniorsList];
        }
      } else if (currentSelectedSenior && seniorsList.length === 0) {
        console.log('📝 빈 목록에 선택된 시니어 추가:', currentSelectedSenior.seniorName);
        seniorsList = [currentSelectedSenior];
      }
      
      // 중복 제거
      const uniqueSeniorsList = seniorsList.filter((senior, index, self) => 
        index === self.findIndex(s => s.id === senior.id)
      );
      
      setAllSeniors(uniqueSeniorsList);
      
    } catch (error) {
      console.error('❌ 시니어 목록 조회 오류:', error);
      if (currentSelectedSenior) {
        setAllSeniors([currentSelectedSenior]);
      }
    } finally {
      setSeniorsLoading(false);
    }
  };

  // 초기화 및 설정
  useEffect(() => {
    if (open && selectedSenior) {
      console.log('🚀 모달 열림 - selectedSenior:', selectedSenior);
      
      setCurrentSelectedSenior(selectedSenior);
      setCurrentSelectedDate(selectedDate || new Date());
      setAllSeniors([selectedSenior]);
      
      fetchUserSettings();
      loadDetailData(selectedSenior, selectedDate || new Date());
      
      setTimeout(() => {
        fetchAllSeniors();
      }, 100);
      
    } else if (!open) {
      setCurrentSelectedSenior(null);
      setCurrentSelectedDate(new Date());
      setAllSeniors([]);
    }
  }, [open, selectedSenior, selectedDate]);

  // 차트 업데이트 (중복 생성 방지)
  useEffect(() => {
    if (vitalData.length > 0 && !loading && !legendLoading) {
      const timeoutId = setTimeout(() => {
        try {
          console.log('📊 차트 업데이트 조건 충족 - 차트 생성 시작');
          const result = processVitalDataFor24Hours(vitalData);
          const { processedData, lastMeasurementHour } = result;
          const statusAnalysis = analyzeVitalStatus(vitalData, userSettings, alertSettings);
          
          createMainChart(processedData, lastMeasurementHour, currentSelectedSenior);
          createSummaryChart(statusAnalysis);
        } catch (error) {
          console.error('차트 업데이트 오류:', error);
        }
      }, 150);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('📊 차트 업데이트 조건 미충족:', {
        hasVitalData: vitalData.length > 0,
        loading,
        legendLoading
      });
    }
  }, [vitalData, thresholdLines, userSettings]); // visibleDatasets 의존성 제거로 중복 방지

  // 차트 정리
  useEffect(() => {
    return () => {
      Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [chartInstances]);

  const statusAnalysis = analyzeVitalStatus(vitalData, userSettings, alertSettings);
  const result = processVitalDataFor24Hours(vitalData);
  const { processedData } = result;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
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
          height: '40px'
        }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h6" component="div" fontWeight="bold">
              💓 바이탈 상세
            </Typography>
            
            {/* 시니어 선택 및 날짜 선택 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>👤</Typography>
              
              {/* 시니어 선택 드롭다운 */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={currentSelectedSenior?.id || ''}
                  onChange={handleSeniorChange}
                  disabled={seniorsLoading || !Array.isArray(allSeniors) || allSeniors.length === 0}
                  displayEmpty
                  IconComponent={ExpandMore}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        '& .MuiMenuItem-root': {
                          minHeight: 'auto',
                          py: 1
                        }
                      }
                    }
                  }}
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
              <CalendarIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              
              {/* 날짜 선택 달력 */}
              <DatePicker
                value={currentSelectedDate}
                onChange={handleDateChange}
                disabled={loading}
                maxDate={new Date()}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      minWidth: 140,
                      '& .MuiInputBase-root': {
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
                    }
                  }
                }}
                format="yyyy-MM-dd"
              />
            </Box>
          </Box>
          
          {/* 상태 표시 + 설정 버튼 + 기준선 체크박스 */}
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
            
            {/* 기준선 드롭다운 메뉴 */}
            <ThresholdMenu 
              thresholdLines={thresholdLines}
              onThresholdLineChange={handleThresholdLineChange}
              selectedThresholdCount={selectedThresholdCount}
              totalThresholdCount={totalThresholdCount}
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

        <DialogContent sx={{ p: 2, height: 'calc(90vh - 100px)', overflow: 'hidden', pb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={60} />
              <Typography sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
            </Box>
          ) : vitalData.length === 0 ? (
            <EmptyDataView 
              currentSelectedSenior={currentSelectedSenior}
              currentSelectedDate={currentSelectedDate}
              onDateChange={handleDateChange}
              findLatestData={findLatestData}
              loading={loading}
              setLoading={() => {}} // 이 부분은 useVitalData 훅에서 관리되므로 빈 함수
              onClose={onClose}
            />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* 메인 차트와 요약 정보를 한 박스에 통합 */}
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 상단: 메인 차트 (60% 높이) */}
                <Box sx={{ height: '60%', mb: 2 }}>
                  <canvas ref={mainChartRef} style={{ width: '100%', height: '100%' }} />
                </Box>

                {/* 하단: 요약 정보들 (40% 높이) - 3등분 */}
                <Box sx={{ height: '40%', display: 'flex', gap: 3, alignItems: 'stretch', mt: 2, pb: 4 }}>
                  {/* 왼쪽: 측정 분포 차트 */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1, color: '#333' }}>
                      📊 측정 분포
                    </Typography>
                    <Box sx={{ flex: 1, width: '100%', minHeight: 0, maxHeight: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: '280px', height: '200px' }}>
                        <canvas ref={summaryChartRef} style={{ width: '100%', height: '100%' }} />
                      </div>
                    </Box>
                  </Box>

                  {/* 가운데: 상세 분석 */}
                  <DetailAnalysis 
                    statusAnalysis={statusAnalysis}
                    vitalData={vitalData}
                  />

                  {/* 오른쪽: 측정 통계 */}
                  <MeasurementStats 
                    vitalData={vitalData}
                    statusAnalysis={statusAnalysis}
                    processedData={processedData}
                  />
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default VitalSignsDetailModal;
