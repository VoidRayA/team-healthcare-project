import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,  
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,  
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,  
  EventOutlined,  
  LogoutOutlined,
  WarningAmberOutlined,  
  FavoriteOutlined,
  DevicesOutlined,    
  SettingsOutlined,  
  EditOutlined,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import userImage from '../images/user.png';
import HospitalMapModal from './modals/HospitalMapModal';
import { getWeatherInfo, testIPLocation, testAllLocations, forceKoreanLocation } from '../utils/weatherAPI';
import Calendar from 'react-calendar';
// API 클라이언트 import로 axios 대체 (2025.07.08)
import { getSeniorsForDate, getSeniorsWithPagination, getSeniorDailyActivities, getScheduleDropdownItems, getVitalSignsByDate } from '../api/apiClient';
// 카카오 API 유틸리티 import (2025.07.08)
import { searchAddressToCoord, searchPlacesByKeyword, searchHospitalsByLocation } from '../utils/kakaoAPI';
// 향상된 주소 검색 import
import { enhancedAddressSearch, validateSearchResult } from '../utils/enhancedAddressSearch';
import { getUserInfo, clearAuthData, getAuthToken } from '../utils/auth';
// 개선된 위치 서비스 import
import { getCurrentPosition, checkGeolocationSupport } from '../utils/geolocation';
import { parseJwt } from '../utils/auth'; // JWT payload 디코더
// Chart.js import 날짜별 데이터 시각화
import { Chart, registerables } from 'chart.js/auto';

// Chart.js 등록
Chart.register(...registerables);

// 로컬 시간대 기준 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Home = () => {
  const navigate = useNavigate();  
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const [activeMenu, setActiveMenu] = useState('홈');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weather, setWeather] = useState({
    temperature: '로딩 중...',
    condition: '로딩 중...',
    humidity: '로딩 중...',
    location: '서울',
    maxTemp: '-',
    minTemp: '-'
  });
  
  const [seniorStats, setSeniorStats] = useState({
    totalSeniors: 0,
    alerts: 0,
    healthIssues: 0,
    connectedDevices: 0
  });
  const [loading, setLoading] = useState(true);
  
  const [recentActions, setRecentActions] = useState([
    { text: '회원정보 관리', icon: EditOutlined, path: '/profile/management', lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { text: '보호 대상자 관리', icon: PeopleOutlined, path: '/seniors', lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { text: '안전 모니터링', icon: SecurityOutlined, path: '/monitoring', lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { text: '알림 설정', icon: SettingsOutlined, path: '/notifications', lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
  ]);
  
  const [recommendedHospital, setRecommendedHospital] = useState(null);
  
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [seniors, setSeniors] = useState([]); // 보호 대상자 목록
  const [selectedSenior, setSelectedSenior] = useState(null); // 선택된 보호 대상자  
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // 바이탈 사인 차트 관련 state (2025.07.17 추가)
  const [vitalSignsData, setVitalSignsData] = useState([]);
  const [vitalSignsLoading, setVitalSignsLoading] = useState(false);
  const [chartInstance, setChartInstance] = useState(null);
  
  // 오늘의 할 일 로드
  const loadTodaySchedule = async () => {
    try {
      setScheduleLoading(true);
      console.log('오늘의 할 일 로드 시작');
      
      const scheduleItems = await getScheduleDropdownItems();
      console.log('로드된 일정 항목들:', scheduleItems);      
      
    } catch (error) {
      console.error('오늘의 할 일 로드 오류:', error);
    } finally {
      setScheduleLoading(false);
    }
  };  
  
  // 바이탈 사인 데이터 로드 (2025.07.17 추가) - 실제 데이터만 사용
  const loadVitalSignsData = async (seniorId, date = null) => {
    try {
      setVitalSignsLoading(true);
      
      // 날짜가 지정되지 않으면 오늘 날짜 사용
      const targetDate = date || getLocalDateString(new Date()); // 타임존 문제 해결
      console.log(`💓 바이탈 사인 데이터 로드 시작:`);
      console.log(`   - Senior ID: ${seniorId}`);
      console.log(`   - Senior 이름: ${selectedSenior?.seniorName || '알 수 없음'}`);
      console.log(`   - 날짜: ${targetDate}`);
      console.log(`   - API URL: /api/seniors/${seniorId}/vitalSign/date/${targetDate}`);
      
      // API 호출
      const vitalData = await getVitalSignsByDate(seniorId, targetDate);
      console.log('바이탈 사인 API 성공:', vitalData);
      
      if (vitalData && vitalData.length > 0) {
        setVitalSignsData(vitalData);
        updateVitalChart(vitalData, selectedDate, selectedSenior, chartInstance, setChartInstance);
        console.log(`✅ 실제 API 데이터 사용: ${vitalData.length}건`);
      } else {
        console.log('📝 해당 날짜에 데이터가 없습니다.');
        setVitalSignsData([]);
        updateVitalChart([], selectedDate, selectedSenior, chartInstance, setChartInstance); // 빈 데이터로 차트 업데이트
      }
      
    } catch (error) {
      console.error('바이탈 사인 데이터 로드 오류:', error);
      console.error(`실패한 API: /api/seniors/${seniorId}/vitalSign/date/${date || getLocalDateString(new Date())}`);
      
      if (error.response?.status === 404) {
        console.log('📝 해당 Senior의 바이탈 데이터가 없습니다.');
      } else {
        console.error('😨 API 호출 오류:', error.message);
      }
      
      // 에러 시 빈 데이터 표시
      setVitalSignsData([]);
      updateVitalChart([], selectedDate, selectedSenior, chartInstance, setChartInstance);
    } finally {
      setVitalSignsLoading(false);
    }
  };
  
  // 더미 바이탈 데이터 생성 - Senior별 다른 데이터
  const generateDummyVitalData = () => {
    const times = ['09:00', '12:00', '15:00', '18:00', '21:00'];
    const seniorId = selectedSenior?.id || 1;
    
    // Senior ID에 따라 약간 다른 기본값 사용
    const baseValues = {
      bloodPressureHigh: 115 + (seniorId % 3) * 5,  // 115-125 범위
      bloodPressureLow: 75 + (seniorId % 3) * 3,    // 75-81 범위  
      heartRate: 68 + (seniorId % 4) * 4,           // 68-80 범위
      bloodSugar: 85 + (seniorId % 5) * 5,          // 85-105 범위
      bodyTemperature: 36.3 + (seniorId % 3) * 0.2  // 36.3-36.7 범위
    };
    
    return times.map((time, index) => {
      // 시간대에 따라 약간의 변화 추가
      const timeVariation = {
        morning: index === 0 ? -3 : 0,   // 아침에는 약간 낮음
        afternoon: index === 2 ? 2 : 0,  // 오후에는 약간 높음
        evening: index === 4 ? -1 : 0    // 저녁에는 약간 낮음
      };
      
      const variation = timeVariation.morning + timeVariation.afternoon + timeVariation.evening;
      
      return {
        id: index + 1,
        measurementTime: `${new Date().toISOString().split('T')[0]}T${time}:00`,
        bloodPressureHigh: baseValues.bloodPressureHigh + variation + Math.floor(Math.random() * 10 - 5),
        bloodPressureLow: baseValues.bloodPressureLow + Math.floor(variation/2) + Math.floor(Math.random() * 6 - 3),
        heartRate: baseValues.heartRate + variation + Math.floor(Math.random() * 8 - 4),
        bloodSugar: baseValues.bloodSugar + Math.floor(Math.random() * 20 - 10),
        bodyTemperature: Number((baseValues.bodyTemperature + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        isNormal: Math.random() > 0.15, // 85% 정상
        notes: `${time} 측정 데이터 (${selectedSenior?.seniorName || '대상자'}님)`
      };
    });
  };
  
// 바이탈 데이터 필터링 및 정리 함수 (시간대별 그룹화)
const processVitalData = (rawData, selectedDate) => {
  if (!rawData || rawData.length === 0) return [];
  
  console.log(`📊 원본 데이터: ${rawData.length}건`);
  
  // 시간대별로 그룹화 (1시간 단위)
  const hourlyData = {};
  
  rawData.forEach(item => {
    const time = new Date(item.measurementTime);
    const hour = time.getHours();
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = [];
    }
    hourlyData[hourKey].push(item);
  });
  
  // 각 시간대별 평균값 계산
  const processedData = Object.keys(hourlyData)
    .sort() // 시간순 정렬
    .map(hourKey => {
      const items = hourlyData[hourKey];
      const avgData = {
        measurementTime: `${getLocalDateString(selectedDate)}T${hourKey}:00`,
        bloodPressureHigh: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureHigh || 0), 0) / items.length),
        bloodPressureLow: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureLow || 0), 0) / items.length),
        heartRate: Math.round(items.reduce((sum, item) => sum + (item.heartRate || 0), 0) / items.length),
        bodyTemperature: Number((items.reduce((sum, item) => sum + (item.bodyTemperature || 0), 0) / items.length).toFixed(1)),
        bloodSugar: Math.round(items.reduce((sum, item) => sum + (item.bloodSugar || 0), 0) / items.length),
        dataCount: items.length, // 해당 시간대 데이터 개수
        // 위험도 판정
        isEmergency: false,
        isWarning: false
      };
      
      // 위험/경고 수치 판정 (의료진 기준)
      avgData.isEmergency = (
        avgData.bloodPressureHigh >= 180 || avgData.bloodPressureHigh <= 90 ||
        avgData.bloodPressureLow >= 110 || avgData.bloodPressureLow <= 60 ||
        avgData.heartRate >= 100 || avgData.heartRate <= 50 ||
        avgData.bodyTemperature >= 38.0 || avgData.bodyTemperature <= 35.5 ||
        avgData.bloodSugar >= 250 || avgData.bloodSugar <= 70
      );
      
      avgData.isWarning = !avgData.isEmergency && (
        avgData.bloodPressureHigh >= 140 || avgData.bloodPressureHigh <= 100 ||
        avgData.bloodPressureLow >= 90 || avgData.bloodPressureLow <= 65 ||
        avgData.heartRate >= 90 || avgData.heartRate <= 60 ||
        avgData.bodyTemperature >= 37.5 || avgData.bodyTemperature <= 36.0 ||
        avgData.bloodSugar >= 180 || avgData.bloodSugar <= 80
      );
      
      return avgData;
    });
  
  console.log(`📈 처리된 데이터: ${processedData.length}개 시간대`);
  console.log('시간대별 요약:', processedData.map(d => `${d.measurementTime.split('T')[1].slice(0,5)}(${d.dataCount}건)`).join(', '));
  
  return processedData;
};

// 혈압 차트 생성 함수
const createBloodPressureChart = (processedData, selectedDate, selectedSenior) => {
  const canvas = document.getElementById('bloodPressureChart');
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
  // 기존 차트 정리
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();
  
  if (!processedData || processedData.length === 0) {
    return createNoDataChart(ctx, '혈압 데이터가 없습니다', selectedDate);
  }
  
  const labels = processedData.map(item => {
    const time = new Date(item.measurementTime);
    return time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  });
  
  const pointColors = processedData.map(point => {
    if (point.isEmergency) return '#ff1744';
    if (point.isWarning) return '#ff9800';
    return '#4caf50';
  });
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '수축기 혈압',
          data: processedData.map(item => item.bloodPressureHigh),
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: false
        },
        {
          label: '이완기 혈압',
          data: processedData.map(item => item.bloodPressureLow),
          borderColor: '#ffa8a8',
          backgroundColor: 'rgba(255, 168, 168, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 }, padding: 10 }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const dataIndex = context[0].dataIndex;
              const pointData = processedData[dataIndex];
              const status = pointData.isEmergency ? '🚨 위험' : pointData.isWarning ? '⚠️ 경고' : '✅ 정상';
              return `${context[0].label} ${status}`;
            },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} mmHg`;
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'mmHg', font: { size: 11 } },
          min: 60,
          max: 200,
          ticks: { font: { size: 9 } }
        },
        x: {
          ticks: { font: { size: 9 } }
        }
      },
      animation: { duration: 700 }
    }
  });
};

// 심박수 + 체온 차트 생성 함수
const createHeartRateTemperatureChart = (processedData, selectedDate, selectedSenior) => {
  const canvas = document.getElementById('heartRateTemperatureChart');
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
  // 기존 차트 정리
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();
  
  if (!processedData || processedData.length === 0) {
    return createNoDataChart(ctx, '심박수 & 체온 데이터가 없습니다', selectedDate);
  }
  
  const labels = processedData.map(item => {
    const time = new Date(item.measurementTime);
    return time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  });
  
  const pointColors = processedData.map(point => {
    if (point.isEmergency) return '#ff1744';
    if (point.isWarning) return '#ff9800';
    return '#4caf50';
  });
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '심박수',
          data: processedData.map(item => item.heartRate),
          borderColor: '#4dabf7',
          backgroundColor: 'rgba(77, 171, 247, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'heartRate',
          fill: false
        },
        {
          label: '체온',
          data: processedData.map(item => item.bodyTemperature),
          borderColor: '#69db7c',
          backgroundColor: 'rgba(105, 219, 124, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          yAxisID: 'temperature',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 }, padding: 10 }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const dataIndex = context[0].dataIndex;
              const pointData = processedData[dataIndex];
              const status = pointData.isEmergency ? '🚨 위험' : pointData.isWarning ? '⚠️ 경고' : '✅ 정상';
              return `${context[0].label} ${status}`;
            },
            label: function(context) {
              const unit = context.datasetIndex === 0 ? ' bpm' : ' °C';
              return `${context.dataset.label}: ${context.parsed.y}${unit}`;
            }
          }
        }
      },
      scales: {
        heartRate: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'bpm', color: '#4dabf7', font: { size: 11 } },
          min: 40,
          max: 120,
          ticks: { font: { size: 9 }, color: '#4dabf7' }
        },
        temperature: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: '°C', color: '#69db7c', font: { size: 11 } },
          min: 35,
          max: 40,
          ticks: { font: { size: 9 }, color: '#69db7c' }
        },
        x: {
          ticks: { font: { size: 9 } }
        }
      },
      animation: { duration: 700 }
    }
  });
};

// No Data 차트 생성 함수
const createNoDataChart = (ctx, message, selectedDate) => {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['데이터 없음'],
      datasets: [{
        data: [1],
        backgroundColor: ['#f5f5f5'],
        borderColor: ['#e0e0e0'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      animation: { duration: 0 }
    },
    plugins: [{
      id: 'noDataText',
      afterDraw: function(chart) {
        const { ctx, chartArea } = chart;
        if (!ctx || !chartArea) return;
        
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Pretendard, sans-serif';
        ctx.fillStyle = '#999';
        ctx.fillText(message, centerX, centerY);
        ctx.restore();
      }
    }]
  });
};

// 2개 차트로 분리된 업데이트 함수
const updateVitalChart = (data, selectedDate, selectedSenior, chartInstance, setChartInstance) => {
  console.log('📈 2개 차트 업데이트 시작:', data);
  
  // 데이터 처리 (시간대별 그룹화)
  const processedData = processVitalData(data, selectedDate);
  
  // 1. 혈압 차트 생성
  const bloodPressureChart = createBloodPressureChart(processedData, selectedDate, selectedSenior);
  
  // 2. 심박수 + 체온 차트 생성
  const heartRateTemperatureChart = createHeartRateTemperatureChart(processedData, selectedDate, selectedSenior);
  
  // 차트 인스턴스 저장 (배열로 관리)
  setChartInstance({
    bloodPressureChart,
    heartRateTemperatureChart
  });
  
  console.log('✅ 2개 차트 업데이트 완료!');
  console.log(`📊 혈압 차트 생성:`, !!bloodPressureChart);
  console.log(`📊 심박수+체온 차트 생성:`, !!heartRateTemperatureChart);
  
  if (processedData && processedData.length > 0) {
    console.log(`📊 표시된 시간대: ${processedData.length}개`);
    console.log(`🔴 위험 구간: ${processedData.filter(d => d.isEmergency).length}개`);
    console.log(`🟠 경고 구간: ${processedData.filter(d => d.isWarning).length}개`);
    console.log(`✅ 정상 구간: ${processedData.filter(d => !d.isEmergency && !d.isWarning).length}개`);
  }
};
  
  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      // SeniorList와 동일한 API 사용 (페이지네이션 지원)
      const response = await getSeniorsWithPagination(0, 100, 'createdAt,desc'); // 전체 데이터 가져오기
      console.log('getSeniorsWithPagination API 응답:', response);
      const seniorsList = response.content || [];
      console.log('로드된 Senior 목록:', seniorsList);
      setSeniors(seniorsList);
      
      // 테스트 할머니(ID 34) 우선 선택, 없으면 첫 번째 Senior 선택
      if (seniorsList.length > 0 && !selectedSenior) {
        // 테스트 할머니(ID 34) 찾기
        const testGrandma = seniorsList.find(senior => senior.id === 34);
        const targetSenior = testGrandma || seniorsList[0];
        
        console.log('기본 선택된 Senior:', targetSenior);
        setSelectedSenior(targetSenior);
        
        // 선택된 Senior의 주소로 병원 검색
        if (targetSenior.address) {
          loadHospitalsByAddress(targetSenior.address);
        }
        // 바이탈 사인 데이터 로드 (2025.07.17 추가)
        loadVitalSignsData(targetSenior.id);
      }
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    }
  };
  
  const handleHospitalSelect = (hospital) => {
    setRecommendedHospital(hospital);
    console.log('병원 선택 완료:', hospital.yadmNm);
  };
  
  // 향상된 주소 검색 함수 - 주소검색 + 키워드검색 조합
  const findLocationByAddress = async (address) => {
    console.log('향상된 주소 검색 시작:', address);
    
    let bestResult = null;
    let bestScore = 0;
    
    try {
      // 1. 주소 검색 API 시도 (여러 단계)
      const addressSearches = [
        address, // 원본 주소
        address.replace(/\s+\d+호.*$/, ''), // 호수 제거
        address.replace(/\s+[가-힣]+[스카이뷰|아파트|빌라|타운|맨션].*$/, ''), // 아파트명 제거
        address.split(' ').slice(0, 4).join(' '), // 시 구 동 + 첫번째 상세주소
        address.split(' ').slice(0, 3).join(' ')  // 시 구 동만
      ];
      
      for (const searchAddr of addressSearches) {
        if (!searchAddr.trim()) continue;
        
        console.log('주소 검색 시도:', searchAddr);
        const result = await searchAddressToCoord(searchAddr);
        
        if (result.success) {
          const score = calculateAddressScore(searchAddr, address);
          console.log(`주소 검색 성공: ${searchAddr} (점수: ${score})`);
          
          if (score > bestScore) {
            bestResult = {
              ...result,
              method: 'address',
              searchTerm: searchAddr,
              score: score
            };
            bestScore = score;
          }
        }
      }
      
      // 2. 키워드 검색 API 시도 (아파트명이 있는 경우)
      const apartmentMatch = address.match(/([가-힣]+[스카이뷰|아파트|빌라|타운|맨션])/);
      if (apartmentMatch) {
        const apartmentName = apartmentMatch[1];
        const locationContext = address.split(' ').slice(0, 3).join(' '); // 시 구 동
        
        const keywordSearches = [
          `${locationContext} ${apartmentName}`, // 전체 조합
          apartmentName, // 아파트명만
          `부산 ${apartmentName}`, // 부산 + 아파트명
        ];
        
        for (const keyword of keywordSearches) {
          console.log('키워드 검색 시도:', keyword);
          
          try {
            const keywordResult = await searchPlacesByKeyword(keyword, { size: 5 });
            
            if (keywordResult.success && keywordResult.places.length > 0) {
              // 가장 관련성 높은 결과 선택
              const relevantPlace = findMostRelevantPlace(keywordResult.places, address);
              
              if (relevantPlace) {
                const score = calculateKeywordScore(relevantPlace, address);
                console.log(`키워드 검색 성공: ${relevantPlace.name} (점수: ${score})`);
                
                if (score > bestScore) {
                  bestResult = {
                    success: true,
                    x: relevantPlace.x,
                    y: relevantPlace.y,
                    address: relevantPlace.address,
                    roadAddress: relevantPlace.roadAddress,
                    method: 'keyword',
                    searchTerm: keyword,
                    placeName: relevantPlace.name,
                    score: score
                  };
                  bestScore = score;
                }
              }
            }
          } catch (error) {
            console.warn(`키워드 검색 오류 (${keyword}):`, error.message);
          }
        }
      }
      
      console.log('최종 최적 결과:', bestResult);
      return bestResult;
      
    } catch (error) {
      console.error('주소 검색 전체 오류:', error);
      return null;
    }
  };
  
  // 주소 검색 결과 점수 계산
  const calculateAddressScore = (searchAddr) => {
    const searchWords = searchAddr.split(' ');    
    
    let score = searchWords.length * 10; // 기본 점수
    
    // 아파트명이 포함되어 있으면 가점
    if (searchAddr.match(/([가-힣]+[스카이뷰|아파트|빌라|타운|맨션])/)) {
      score += 50;
    }
    
    // 도로명이 포함되어 있으면 가점
    if (searchAddr.match(/로|\d+번길|길/)) {
      score += 30;
    }
    
    return score;
  };
  
  // 키워드 검색 결과 점수 계산
  const calculateKeywordScore = (place, originalAddr) => {
    let score = 80; // 키워드 검색 기본 점수
    
    // 주소 매칭 확인
    const addressWords = originalAddr.toLowerCase().split(' ');
    const placeAddress = (place.address || '').toLowerCase();
    
    for (const word of addressWords) {
      if (word && placeAddress.includes(word)) {
        score += 20;
      }
    }
    
    // 카테고리가 아파트/주거와 관련이 있으면 가점
    if (place.category && place.category.includes('아파트')) {
      score += 40;
    }
    
    return score;
  };
  
  // 가장 관련성 높은 장소 찾기
  const findMostRelevantPlace = (places, originalAddr) => {
    const addressWords = originalAddr.toLowerCase().split(' ');
    
    return places.reduce((best, current) => {
      const currentAddress = (current.address || '').toLowerCase();
      const currentScore = addressWords.reduce((score, word) => {
        return currentAddress.includes(word) ? score + 1 : score;
      }, 0);
      
      const bestAddress = (best?.address || '').toLowerCase();
      const bestScore = addressWords.reduce((score, word) => {
        return bestAddress.includes(word) ? score + 1 : score;
      }, 0);
      
      return currentScore > bestScore ? current : best;
    }, places[0]);
  };
  
  // 향상된 주소 기반 병원 검색
  const loadHospitalsByAddress = async (address) => {
    try {
      console.log('🏥 향상된 주소 기반 병원 검색 시작:', address);
      setHospitalLoading(true);
      
      // 향상된 주소 검색 사용
      console.log('🔍 향상된 주소 검색 실행...');
      const searchResult = await enhancedAddressSearch(address);
      
      if (!searchResult.success) {
        console.error('❌ 주소 검색 실패:', searchResult.message);
        // 기본값으로 현재 위치 사용
        console.log('🔄 현재 위치로 대체 검색');
        await loadRecommendedHospital();
        return;
      }
      
      console.log('✅ 주소 검색 성공!');
      console.log(`📍 좌표: 위도 ${searchResult.latitude}, 경도 ${searchResult.longitude}`);
      console.log(`🎯 검색 방법: ${searchResult.method} (점수: ${searchResult.score})`);
      console.log(`📝 출처: ${searchResult.source}`);
      
      // 검증 정보 출력
      const verification = await validateSearchResult(searchResult, address);
      console.log('🔍 검증 정보:', verification.verification);
      
      // 다른 검색 결과들도 출력
      if (searchResult.allResults && searchResult.allResults.length > 1) {
        console.log('📊 모든 검색 결과:');
        searchResult.allResults.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.method}: ${result.latitude}, ${result.longitude} (${result.score}점)`);
        });
      }
      
      // 해당 좌표로 병원 검색
      const hospitalResult = await searchNearbyHospitals(searchResult.latitude, searchResult.longitude);
      
      if (hospitalResult.success && hospitalResult.places) {
        // 인간 의료시설만 필터링
        const filteredPlaces = hospitalResult.places.filter(place => {
          const categoryName = place.category || '';
          const placeName = place.name || '';
          
          // 동물병원 제외
          if (categoryName.includes('동물병원') || 
              placeName.includes('동물병원') ||
              placeName.includes('수의사') ||
              placeName.includes('수의') ||
              placeName.includes('동물의료') ||
              placeName.includes('펫') ||
              placeName.includes('애니멀')) {
            console.log(`❌ 동물병원 제외: ${placeName}`);
            return false;
          }
          
          console.log(`✅ 인간 의료시설 포함: ${placeName}`);
          return true;
        });
        
        const kakaoHospitals = filteredPlaces.map(place => ({
          yadmNm: place.name,
          telno: place.phone || '전화번호 정보 없음',
          addr: place.roadAddress || place.address,
          distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
          categoryName: place.category,
          latitude: place.y,
          longitude: place.x
        }));
        
        setNearbyHospitals(kakaoHospitals);
        setRecommendedHospital(kakaoHospitals[0]);
        
        console.log(`✅ ${kakaoHospitals.length}개 병원 검색 완료`);
        
        // Senior의 위치를 currentPosition으로 설정
        setCurrentPosition({
          latitude: searchResult.latitude,
          longitude: searchResult.longitude,
          address: address,
          resolvedAddress: searchResult.address,
          isSeniorLocation: true,
          searchMethod: searchResult.method,
          searchScore: searchResult.score
        });
      } else {
        console.warn('❌ 병원 검색 결과 없음');
        // 기본값으로 현재 위치 사용
        await loadRecommendedHospital();
      }
    } catch (error) {
      console.error('❌ 향상된 주소 기반 병원 검색 오류:', error);
      // 기본값으로 현재 위치 사용
      await loadRecommendedHospital();
    } finally {
      setHospitalLoading(false);
    }
  };
  
  const loadRecommendedHospital = async () => {
    try {
      console.log('추천 병원 조회 시작');
      setHospitalLoading(true);
      
      console.log('🗺️ 현재위치 획득 시도 중...');
      const position = await getCurrentPosition({ 
        showAlert: false,
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 60000 // 1분간 캐시 허용
      });
      const { latitude, longitude } = position;
      setCurrentPosition(position);
      
      console.log('📍 현재 위치 결과:', position);
      console.log(`📍 좌표: 위도 ${latitude}, 경도 ${longitude}`);
      
      if (position.isDefault) {
        console.log('🏢 기본 위치 사용 중 (부산시청)');
        console.log(`🔍 사유: ${position.message || position.source}`);
        
        // 사용자에게 알림 (한 번만)
        if (!sessionStorage.getItem('locationNotified')) {
          setTimeout(() => {
            if (position.error && position.error.code === 1) {
              alert('위치 권한이 필요합니다.\n브라우저 주소창의 🔒 아이콘을 클릭하고 위치를 허용해주세요.\n\n현재는 부산 시청 위치로 병원을 검색합니다.');
            }
            sessionStorage.setItem('locationNotified', 'true');
          }, 1000);
        }
      } else {
        console.log('✅ 실제 GPS 위치 사용 중');
        console.log(`🎯 정확도: ${position.accuracy}m`);
        
        // 정확도가 너무 낮으면 경고
        if (position.accuracy > 1000) {
          console.warn('⚠️ 위치 정확도가 낮습니다:', position.accuracy + 'm');
        }
      }
      
      const result = await searchNearbyHospitals(latitude, longitude);
      
      console.log('카카오 병원 검색 결과:', result);
      
      if (result.success && result.places && result.places.length > 0) {
        // 인간 의료시설만 필터링
        const filteredPlaces = result.places.filter(place => {
          const categoryName = place.category || '';
          const placeName = place.name || '';
          
          // 동물병원 제외
          if (categoryName.includes('동물병원') || 
              placeName.includes('동물병원') ||
              placeName.includes('수의사') ||
              placeName.includes('수의') ||
              placeName.includes('동물의료') ||
              placeName.includes('펫') ||
              placeName.includes('애니멀')) {
            console.log(`❌ 동물병원 제외: ${placeName}`);
            return false;
          }
          
          console.log(`✅ 인간 의료시설 포함: ${placeName}`);
          return true;
        });
        
        const kakaoHospitals = filteredPlaces.map(place => ({
        yadmNm: place.name,
        telno: place.phone || '전화번호 정보 없음',
        addr: place.roadAddress || place.address,
        distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
        categoryName: place.category,
        latitude: place.y,
        longitude: place.x
      }));
        
        setNearbyHospitals(kakaoHospitals);
        setRecommendedHospital(kakaoHospitals[0]);
        
        console.log(`카카오 API로 ${kakaoHospitals.length}개 병원 로드 완료`);
      } else {
        console.warn('카카오 API에서 병원 정보를 찾을 수 없음');
      }
      
    } catch (error) {
      console.error('병원 검색 오류:', error);
    } finally {
      setHospitalLoading(false);
    }
  };
  
  const getIcon = () => {
    return '🏥';
  };
  
  // getCurrentPosition은 이제 utils/geolocation.js에서 import됨
  
  const searchNearbyHospitals = async (latitude, longitude) => {
    try {
      console.log('🏥 향상된 병원 검색 시작 - 더 많은 병원 찾기');
      
      const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
      
      if (!REST_API_KEY) {
        throw new Error('카카오 API 키가 설정되지 않았습니다.');
      }
      
      // 인간 의료시설만 필터링하는 함수
      const isHumanMedicalFacility = (place) => {
        const categoryName = place.category_name || '';
        const placeName = place.place_name || place.name || '';
        
        // 동물병원 제외
        if (categoryName.includes('동물병원') || 
            placeName.includes('동물병원') ||
            placeName.includes('수의사') ||
            placeName.includes('수의') ||
            placeName.includes('동물의료') ||
            placeName.includes('펫삵') ||
            placeName.includes('애니멀')) {
          return false;
        }
        
        // 기타 비의료 시설 제외
        if (placeName.includes('미용실') ||
            placeName.includes('마사지') ||
            placeName.includes('사우나') ||
            placeName.includes('에스테틱') ||
            placeName.includes('영업점') ||
            placeName.includes('업체')) {
          return false;
        }
        
        // 인간 의료시설 포함 여부 확인
        const validCategories = [
          '병원',
          '의원', 
          '클리닉',
          '의료',
          '진료소',
          '보건소',
          '공중보건',
          '가정의학과',
          '내과',
          '외과',
          '산부인과',
          '소아과',
          '정신과',
          '신경과',
          '안과',
          '이비인후과',
          '치과',
          '피부과',
          '비뇨과',
          '정형외과',
          '성형외과',
          '재활의학과',
          '마취통증의학과',
          '엑스레이',
          '검사의학',
          '응급실',
          '수술실'
        ];
        
        return validCategories.some(category => 
          categoryName.includes(category) || placeName.includes(category)
        );
      };
      
      const allHospitals = new Map(); // 중복 제거를 위한 Map
      
      // 1. 카테고리 검색 (HP8: 병원) - 2페이지로 축소
      console.log('📚 1단계: 카테고리 검색 (병원)');
      for (let page = 1; page <= 2; page++) {
        try {
          const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=HP8&x=${longitude}&y=${latitude}&radius=10000&sort=distance&page=${page}&size=15`,
            {
              headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`
              }
            }
          );
          
          const data = await response.json();
          
          if (data.documents) {
            console.log(`✅ 카테고4리 검색 페이지 ${page}: ${data.documents.length}개 결과`);
            data.documents.forEach(place => {
              allHospitals.set(place.id, {
                name: place.place_name,
                phone: place.phone,
                address: place.address_name,
                roadAddress: place.road_address_name,
                distance: place.distance,
                category: place.category_name,
                x: place.x,
                y: place.y,
                source: '카테고4리 검색'
              });
            });
          }
          
          // 더 이상 결과가 없으면 중단
          if (data.meta && data.meta.is_end) {
            console.log(`🛑 카테고4리 검색 종료 (페이지 ${page})`);
            break;
          }
        } catch (error) {
          console.warn(`⚠️ 카테고4리 검색 페이지 ${page} 실패:`, error.message);
        }
      }
      
      // 2. 키워드 검색 - 인간 의료시설 키워드만
      const keywords = ['병원', '의원', '클리닉', '진료소'];
      
      console.log('📚 2단계: 키워드 검색');
      for (const keyword of keywords) {
        try {
          const keywordResult = await searchPlacesByKeyword(keyword, {
            latitude: latitude,
            longitude: longitude,
            radius: 10000,
            sort: 'distance',
            size: 10
          });
          
          console.log(`✅ 키워드 "${keyword}" 검색:`, keywordResult);
          
          if (keywordResult.success && keywordResult.places && keywordResult.places.length > 0) {
            console.log(`✅ 키워드 "${keyword}" 검색: ${keywordResult.places.length}개 결과`);
            keywordResult.places.forEach(place => {
              // 인간 의료시설만 필터링
              if (isHumanMedicalFacility(place)) {
                allHospitals.set(place.id, {
                  name: place.place_name || place.name,
                  phone: place.phone,
                  address: place.address_name || place.address,
                  roadAddress: place.road_address_name || place.roadAddress,
                  distance: place.distance,
                  category: place.category_name || place.category,
                  x: place.x,
                  y: place.y,
                  source: `키워드 "${keyword}"`
                });
                console.log(`✅ 포함: ${place.place_name || place.name} - ${place.category_name || place.category}`);
              } else {
                console.log(`❌ 제외: ${place.place_name || place.name} - ${place.category_name || place.category}`);
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ 키워드 "${keyword}" 검색 실패:`, error.message);
        }
      }
      
      // 3. 결과 정리 및 정렬 (상위 10개만 선택)
      const hospitalList = Array.from(allHospitals.values()).slice(0, 10);
      
      // 거리순 정렬
      hospitalList.sort((a, b) => {
        const distanceA = parseInt(a.distance) || 999999;
        const distanceB = parseInt(b.distance) || 999999;
        return distanceA - distanceB;
      });
      
      console.log(`🏥 총 ${hospitalList.length}개 인간 의료시설 선택! (상위 10개)`);
      
      // 상세 로그
      console.log('📊 병원 검색 결과 상세:');
      hospitalList.forEach((hospital, index) => {
        const distance = hospital.distance ? 
          (parseInt(hospital.distance) >= 1000 ? 
            `${(parseInt(hospital.distance) / 1000).toFixed(1)}km` : 
            `${parseInt(hospital.distance)}m`) : 'N/A';
        console.log(`  ${index + 1}. ${hospital.name} (${distance}) - ${hospital.source} - ${hospital.category}`);
      });
      
      return {
        success: true,
        places: hospitalList.map(place => ({
          name: place.name,
          phone: place.phone || '전화번호 정보 없음',
          address: place.address,
          roadAddress: place.roadAddress,
          distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
          category: place.category,
          x: place.x,
          y: place.y
        }))
      };
    } catch (error) {
      console.error('❌ 카카오 병원 검색 API 오류:', error);
      return { success: false, places: [] };
    }
  };
  
  // Senior 선택 핸들러 - useEffect에서 처리하므로 중복 호출 제거
  const handleSeniorSelect = (senior, useCurrentLocation = false) => {
    console.log('선택된 Senior:', senior);
    console.log('현재위치 사용 여부:', useCurrentLocation);
    console.log('현재 selectedDate:', selectedDate);
    setSelectedSenior(senior); // useEffect에서 자동으로 바이탈 데이터 로드
    
    if (useCurrentLocation) {
      console.log('🗺️ 현재위치 기준으로 병원 검색');
      loadRecommendedHospital();
    } else if (senior.address) {
      console.log('🏠 Senior 주소 기준으로 병원 검색:', senior.address);
      loadHospitalsByAddress(senior.address);
    } else {
      console.log('🗺️ 주소 없음 - 현재위치 사용');
      loadRecommendedHospital();
    }
  };
  
  const updateRecentAction = (actionText) => {
    setRecentActions(prev => 
      prev.map(action => 
        action.text === actionText 
          ? { ...action, lastUsed: new Date() }
          : action
      ).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    );
  };  

  useEffect(() => {
    const userInfo = getUserInfo();
    console.log('현재 로그인 사용자:', userInfo);
    
    if (userInfo) {
      setGuardianInfo({
        name: userInfo.name,
        loginId: userInfo.loginId,
        role: userInfo.role || 'GUARDIAN'
      });
    }
    
    // 위치 서비스 지원 상태 확인
    checkGeolocationSupport().then(support => {
      console.log('🗺️ 위치 서비스 지원 상태:', support);
      if (!support.supported) {
        console.warn('⚠️ 브라우저가 위치 서비스를 지원하지 않습니다.');
      }
      if (!support.secure) {
        console.warn('⚠️ HTTP 환경에서는 위치 서비스가 제한됩니다.');
      }
      if (support.permission === 'denied') {
        console.warn('⚠️ 위치 권한이 거부되어 있습니다.');
      }
    });
    
    loadDataForDate(new Date());
    loadWeatherData();
    loadSeniors(); // 보호 대상자 목록 로드
    loadTodaySchedule(); // 오늘의 할 일 로드
    
    // 디버깅용 전역 함수 등록
    window.testIPLocation = testIPLocation;
    window.testAllLocations = testAllLocations;
    window.forceKoreanLocation = forceKoreanLocation;
    console.log('🔧 디버깅 함수 등록 완료:');
    console.log('- window.testIPLocation() : IP 위치 테스트');
    console.log('- window.testAllLocations() : 전체 위치 테스트');
    console.log('- window.forceKoreanLocation() : 한국어 변환 테스트');
    
    // cleanup 함수: 컴포넌트 언마운트 시 차트 인스턴스 정리
    return () => {
      if (chartInstance) {
        if (chartInstance.bloodPressureChart) {
          chartInstance.bloodPressureChart.destroy();
          console.log('혈압 차트 인스턴스 정리 완료');
        }
        if (chartInstance.heartRateTemperatureChart) {
          chartInstance.heartRateTemperatureChart.destroy();
          console.log('심박수+체온 차트 인스턴스 정리 완료');
        }
      }
    };
  }, []);
  
  // selectedDate 또는 selectedSenior가 변경될 때마다 바이탈 데이터 로드
  useEffect(() => {
    console.log('🔄 useEffect 트리거 됨!');
    console.log('   - selectedSenior:', selectedSenior);
    console.log('   - selectedDate:', selectedDate);
    
    if (selectedSenior && selectedSenior.id && selectedDate) {
      const dateString = getLocalDateString(selectedDate); // 타임존 문제 해결
      console.log(`🔄 useEffect - 바이탈 데이터 재로드:`);
      console.log(`   - Senior ID: ${selectedSenior.id}`);
      console.log(`   - Senior 이름: ${selectedSenior.seniorName}`);
      console.log(`   - selectedDate 객체:`, selectedDate);
      console.log(`   - 로컬 날짜 문자열: ${dateString}`);
      console.log(`   - API 호출할 URL: /api/seniors/${selectedSenior.id}/vitalSign/date/${dateString}`);
      
      loadVitalSignsData(selectedSenior.id, dateString);
    } else {
      console.log('🙅 useEffect 조건 믈충족:');
      console.log('   - selectedSenior 존재:', !!selectedSenior);
      console.log('   - selectedSenior.id 존재:', !!(selectedSenior && selectedSenior.id));
      console.log('   - selectedDate 존재:', !!selectedDate);
    }
  }, [selectedDate, selectedSenior]);
  
  // 차트 컨트롤러 초기화 - Canvas가 DOM에 준비된 후 실행
  useEffect(() => {
    // 차트 컨테이너가 렌더링된 후 Canvas 요소 확인
    const checkCanvas = () => {
      const bloodPressureCanvas = document.getElementById('bloodPressureChart');
      const heartRateTemperatureCanvas = document.getElementById('heartRateTemperatureChart');
      
      if (bloodPressureCanvas && heartRateTemperatureCanvas) {
        console.log('✅ 2개 차트 Canvas 준비 완료!');
        console.log('📈 혈압 Canvas:', bloodPressureCanvas);
        console.log('📈 심박수+체온 Canvas:', heartRateTemperatureCanvas);
        
        // 현재 바이탈 데이터가 있으면 차트 업데이트
        if (vitalSignsData && vitalSignsData.length > 0) {
          console.log('🔄 기존 바이탈 데이터로 2개 차트 재생성:', vitalSignsData.length, '건');
          updateVitalChart(vitalSignsData, selectedDate, selectedSenior, chartInstance, setChartInstance);
        }
      } else {
        console.warn('⚠️ 2개 차트 Canvas가 아직 준비되지 않음');
      }
    };
    
    // DOM 업데이트 대기
    const timer = setTimeout(checkCanvas, 100);
    return () => clearTimeout(timer);
  }, [vitalSignsData]); // vitalSignsData가 변경될 때마다 실행
  
  const loadDataForDate = async (date) => {
    console.log('📅 달력에서 선택된 날짜:', date);
    console.log('📅 로컬 날짜 문자열:', date.toLocaleDateString('ko-KR'));
    console.log('📅 로컬 날짜 문자열(수정):', getLocalDateString(date));
    
    // selectedDate state 먼저 업데이트
    console.log('🔄 setSelectedDate 호출 전 - 이전 selectedDate:', selectedDate);
    setSelectedDate(date);
    console.log('🔄 setSelectedDate 호출 후 - 새로운 selectedDate 설정됨');
    
    // 선택된 날짜로 Senior 데이터 및 바이탈 데이터 로드
    await Promise.all([
      loadSeniorDataForDate(date),
      loadRecentActivitiesForDate(date)
    ]);
    
    // 선택된 Senior가 있으면 해당 날짜의 바이탈 데이터도 로드 (직접 호출)
    if (selectedSenior && selectedSenior.id) {
      const dateString = getLocalDateString(date); // 타임존 문제 해결
      console.log(`📅 달력 선택 날짜(${dateString})의 바이탈 데이터 직접 로드: ${selectedSenior.seniorName}`);
      console.log(`📅 직접 API 호출: /api/seniors/${selectedSenior.id}/vitalSign/date/${dateString}`);
      
      // 지연 실행으로 state 업데이트 대기
      setTimeout(() => {
        console.log(`🕰️ 지연 실행 - 최종 날짜: ${getLocalDateString(date)}`);
        loadVitalSignsData(selectedSenior.id, getLocalDateString(date));
      }, 100);
    }
  };
  
  const loadSeniorDataForDate = async (date) => {
    try {
      setLoading(true);
      
      const dateString = getLocalDateString(date); // 타임존 문제 해결
      
      console.log('변환된 날짜 문자열:', dateString);
      
      const response = await getSeniorsForDate(dateString);
      
      console.log(`${dateString} Senior 데이터 응답:`, response);
      
      const seniors = response.content || [];
      const totalCount = seniors.length;
      
      setSeniorStats({
        totalSeniors: totalCount,
        alerts: Math.floor(totalCount * 0.1),
        healthIssues: Math.floor(totalCount * 0.2),
        connectedDevices: totalCount * 2
      });
      
    } catch (error) {
      console.error('Senior 데이터 로드 오류:', error);
      
      if (error.response?.status === 401) {
        console.error('인증 만료. 로그인이 필요합니다.');
        // 로그인 페이지로 이동
        navigate('/login');
      } else if (error.response?.status === 403) {
        console.error('접근 권한이 없습니다.');
      } else {
        console.error('데이터 로드 실패.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const loadWeatherData = async () => {
    try {
      console.log('🌦️ 날씨 정보 로드 시작');
      
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
      }
      
      console.log('🌍 자동 위치 감지로 날씨 정보 조회...');
      const weatherData = await getWeatherInfo(apiKey);
      
      console.log('🌡️ 날씨 데이터 결과:', weatherData);
      console.log('📍 위치 정보:', {
        '표시되는 위치': weatherData.location,
        '소스': weatherData.source || '소스 정보 없음'
      });
      
      setWeather(weatherData);
      
    } catch (error) {
      console.error('❌ 날씨 정보 로드 오류:', error);
      
      setWeather({
        temperature: '22°C',
        condition: '맑음',
        humidity: '65%',
        location: '기본 위치',
        maxTemp: '25°C',
        minTemp: '18°C'
      });
    }
  };
  
  const loadRecentActivitiesForDate = async (date) => {
    try {
      setActivitiesLoading(true);
      
      const dateString = getLocalDateString(date); // 타임존 문제 해결
      
      console.log('Activities API 호출 날짜:', dateString);
      
      const seniorsResponse = await getSeniorsWithPagination(0, 100, 'createdAt,desc');
      
      console.log('Senior 목록 응답:', seniorsResponse);
      
      const seniors = seniorsResponse.content || [];
      if (seniors.length === 0) {
        console.warn('관리하는 Senior가 없습니다.');
        setRecentActivitiesData([]);
        return;
      }
      
      const firstSeniorId = seniors[0].id;
      console.log('첫 번째 Senior ID:', firstSeniorId);
      
      const activitiesResponse = await getSeniorDailyActivities(firstSeniorId);
      
      console.log(`전체 Activities 데이터 응답:`, activitiesResponse);
      
      const seniorData = activitiesResponse?.seniors?.[0];
      const allActivities = seniorData?.dailyActivities || [];
      
      console.log('seniorData:', seniorData);
      console.log('allActivities 개수:', allActivities.length);
      
      const filteredActivities = allActivities.filter(activity => {
        const activityDate = activity.activityDate;
        if (activityDate) {
          return activityDate === dateString;
        }
        return false;
      });
      
      console.log(`${dateString} 필터링된 Activities:`, filteredActivities);
      
      const formattedActivities = filteredActivities.slice(0, 10).map(activity => {
        let status = 'success';
        
        if (activity.sleepQuality === 'bad' || activity.mealCount === 0) {
          status = 'error';
        }
        else if (activity.sleepQuality === 'normal' || activity.mealCount === 1) {
          status = 'warning';
        }
        
        console.log(`Activity ${activity.id}: sleep=${activity.sleepQuality}, meal=${activity.mealCount} -> status=${status}`);
        
        return {
          time: activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          user: seniorData?.seniorName || '어르신',
          activity: `식사 ${activity.mealCount || 0}회, 수면: ${activity.sleepQuality || '미기록'}, ${activity.dailyNotes || '상세내용없음'}`,
          status: status
        };
      });
      
      setRecentActivitiesData(formattedActivities);
      
    } catch (error) {
      console.error('Recent Activities 데이터 로드 오류:', error);
      
      if (error.response?.status === 401) {
        console.error('인증 만료. 로그인이 필요합니다.');
      } else if (error.response?.status === 404) {
        console.error('Senior 또는 Activities API를 찾을 수 없습니다.');
        setRecentActivitiesData([]);
      } else if (error.response?.status === 403) {
        console.error('해당 Senior에 대한 접근 권한이 없습니다.');
        setRecentActivitiesData([]);
      } else {
        console.error('Recent Activities 데이터 로드 실패. 기본값 사용.');
        setRecentActivitiesData([]);
      }
    } finally {
      setActivitiesLoading(false);
    }
  };  

  const handleLogout = async () => {
    const accessToken = getAuthToken();
    const tokenId = accessToken ? parseJwt(accessToken)?.jti : null;
  
    try {
      if (tokenId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId }), // ✅ key는 tokenId
        });
      }
    } catch (e) {
      console.warn('로그아웃 실패:', e);
    }
  
    clearAuthData();
    alert('로그아웃 되었습니다.');
    window.location.reload();
  };

  const menuItems = [
    { text: '홈', icon: DashboardOutlined },
    { text: '회원정보 관리', icon: EditOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '설정', icon: SettingsOutlined }
  ];

  const statusData = [
    {
      title: '긴급 알림',
      count: loading ? '...' : seniorStats.alerts,
      icon: WarningAmberOutlined,
      color: '#ff4444'
    },
    {
      title: '금일 대상자',
      count: loading ? '...' : seniorStats.totalSeniors,
      icon: PeopleOutlined,
      color: '#2196f3'
    },
    {
      title: '건강 상태',
      count: loading ? '...' : seniorStats.healthIssues,
      icon: FavoriteOutlined,
      color: '#4caf50'
    },
    {
      title: '연결 장치',
      count: loading ? '...' : seniorStats.connectedDevices,
      icon: DevicesOutlined,
      color: '#9c27b0'
    }
  ];

  const getColoredIcon = (iconCode) => {
    const map = {
      '01n': '01d',
      '02n': '02d',
      '03n': '03d',
      '04n': '04d',
      '09n': '09d',
      '10n': '10d',
      '11n': '11d',
      '13n': '13d',
      '50n': '50d',
    };
    return map[iconCode] || iconCode;
  };




  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#CCE5FF',
      display: 'flex',  
      gap: 0,
      overflow: 'hidden'
    }}>
      {/* 왼쪽 사이드바 - 고정 위치 */}
      <Paper sx={{
        width: '240px',
        height: '100vh',
        backgroundColor: '#1976d2',
        borderRadius: '0 20px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        color: 'white',
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        {/* 사용자 정보 영역 */}
        <Box sx={{ 
          px: 2, 
          py: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* 사용자 아이콘 */}
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            overflow: 'hidden'
          }}>
            <img 
              src={userImage} 
              alt="User" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
          
          {/* 사용자 정보 */}
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            {guardianInfo.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
            {guardianInfo.role === 'ADMIN' ? '관리자' : '보호자'}
          </Typography>
        </Box>

        <List sx={{
          padding: '0 20px',
          flex: 1,
          '& .MuiListItem-root': {
            borderRadius: 1.5,
            marginBottom: 1,
            color: 'white',
            cursor: 'pointer',
            transition: theme => theme.transitions.create(['background-color', 'transform'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'translateX(4px)'
            },
            '&.active': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          },
          '& .MuiListItemIcon-root': {
            color: 'white',
            minWidth: '40px',
          }
        }}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <ListItem
                key={index}
                className={activeMenu === item.text ? 'active' : ''}
                onClick={() => {
                  if (item.text === '회원정보 관리') {
                    updateRecentAction(item.text);
                    // 직접 ProfileManagement로 이동 (모달은 ProfileManagement에서 처리)
                    navigate('/profile/management');
                  } else if (item.text === '보호 대상자') {
                    updateRecentAction(item.text);
                    navigate('/seniors');
                  } else if (item.text === '일정 관리') {
                    updateRecentAction(item.text);
                    navigate('/daily');
                  } else {
                    setActiveMenu(item.text);
                    updateRecentAction(item.text);
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>

        {/* 로그아웃 버튼 */}
        <Box sx={{ px: 2 }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              color: 'white',
              cursor: 'pointer',
              transition: theme => theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.short,
              }),
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary="로그아웃" />
          </ListItem>
        </Box>
      </Paper>

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        overflow: 'auto',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }}>
        {/* 중앙 메인 콘텐츠 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          padding: 4,
          gap: 2.5
        }}>
          {/* 왼쪽 콘텐츠 */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 상단 헤더 */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '200px',              
              marginBottom: 3,
              paddingTop: 1
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 5, color: '#333' }}>
                  안녕하세요, <span style={{ color: '#1976d2' }}>{guardianInfo.name}</span> 님
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  오늘도 소중한 분의 안전을 지켜주세요.
                </Typography>
              </Box>
            </Box>

            {/* 하단 3개 박스 */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 2,
              padding: `0 0 2.5 0`
            }}>
              {/* 왼쪽 박스 - 상태 현황 */}
              {/* <Paper sx={{
                backgroundColor: '#ffffff',
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: 2.5,
                minHeight: '450px',
                overflow: 'auto',
                boxShadow: 2
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 헬스 모니터링 센터
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 2, 
                  mt: 2 
                }}>
                  {statusData.map((status, index) => {
                    const IconComponent = status.icon;
                    return (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          backgroundColor: '#1976D2',
                          color: 'white',
                          padding: 2,
                          borderRadius: 1.25,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          minHeight: '120px',
                          transition: theme => theme.transitions.create(['transform', 'box-shadow'], {
                            duration: theme.transitions.duration.short,
                          }),
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                          }
                        }}
                      >
                        <IconComponent sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {status.count}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                          {status.title}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper> */}
              
              {/* Chart.js 차트가 들어갈 새로운 박스 - 바이탈 사인 */}
              <Paper sx={{
                backgroundColor: '#ffffff',
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: 2.5,
                minHeight: '520px',
                overflow: 'auto',
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💓 오늘의 바이탈 사인
                </Typography>
                
                {vitalSignsLoading ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '380px',
                    gap: 2
                  }}>
                    <Typography sx={{
                      color: '#666',
                      fontFamily: 'Pretendard'
                    }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                    {/* 혈압 차트 */}
                    <Box sx={{
                      flex: 1,
                      minHeight: '200px',
                      maxHeight: '220px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff6b6b', fontSize: '1rem' }}>
                        🩸 혈압 (mmHg)
                      </Typography>
                      <Box sx={{ height: 'calc(100% - 35px)', position: 'relative' }}>
                        <canvas 
                          id="bloodPressureChart" 
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* 심박수 + 체온 차트 */}
                    <Box sx={{
                      flex: 1,
                      minHeight: '200px',
                      maxHeight: '220px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#4dabf7', fontSize: '1rem' }}>
                        💓 심박수 & 🌡️ 체온
                      </Typography>
                      <Box sx={{ height: 'calc(100% - 35px)', position: 'relative' }}>
                        <canvas 
                          id="heartRateTemperatureChart" 
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* 바이탈 사인 요약 정보 */}
                {vitalSignsData.length > 0 ? (
                  <Box sx={{
                    marginTop: 2,
                    padding: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1
                  }}>
                    <Typography variant="caption" sx={{
                      color: '#666',
                      fontFamily: 'Pretendard',
                      fontSize: '12px',
                      display: 'block',
                      textAlign: 'center'
                    }}>
                      총 {vitalSignsData.length}건의 측정 데이터 (오늘)
                    </Typography>
                    {selectedSenior && (
                      <Typography variant="caption" sx={{
                        color: '#1976d2',
                        fontFamily: 'Pretendard',
                        fontSize: '11px',
                        display: 'block',
                        textAlign: 'center',
                        marginTop: 0.5
                      }}>
                        {selectedSenior.seniorName || '보호 대상자'}님의 건강 데이터
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{
                    marginTop: 2,
                    padding: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1,
                    border: '1px dashed #ddd'
                  }}>
                    <Typography variant="caption" sx={{
                      color: '#999',
                      fontFamily: 'Pretendard',
                      fontSize: '12px',
                      display: 'block',
                      textAlign: 'center'
                    }}>
                      해당 날짜에 측정된 데이터가 없습니다
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#bbb',
                      fontFamily: 'Pretendard',
                      fontSize: '11px',
                      display: 'block',
                      textAlign: 'center',
                      marginTop: 0.5
                    }}>
                      다른 날짜를 선택하여 데이터를 확인해보세요
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* 중간 박스 - 최근 활동 현황 */}
              <Paper sx={{
                backgroundColor: '#ffffff',
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: 2.5,
                minHeight: '450px',
                overflow: 'auto',
                boxShadow: 2
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  🔔 오늘의 알림
                </Typography>                
                {/* 로딩 상태 또는 데이터 없을 때 처리 */}
                {activitiesLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      데이터를 불러오는 중...
                    </Typography>
                  </Box>
                ) : recentActivitiesData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      최근 활동 내역이 없습니다.
                    </Typography>
                  </Box>
                ) : (
                  recentActivitiesData.map((activity, index) => (
                    <Box key={index} sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: theme => theme.spacing(1.5, 0),
                      borderBottom: theme => `1px solid ${theme.palette.grey[100]}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="500">
                            {activity.user}
                          </Typography>
                          <Chip
                            label={
                              activity.status === 'warning' ? '주의' :
                              activity.status === 'success' ? '정상' : '긴급'
                            }
                            color={activity.status === 'warning' ? 'warning' : 
                                    activity.status === 'success' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {activity.activity}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', minWidth: '60px' }}>
                        <Typography variant="body2" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>

              {/* 오른쪽 박스 - 오늘의 할 일 & 요약 */}
              <Paper sx={{
                backgroundColor: '#ffffff',
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: 2.5,
                minHeight: '450px',
                overflow: 'auto',
                boxShadow: 2
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 관리 대상자 항목
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* 관리 대상자 */}
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2', fontSize: '1.2rem' }}>
                      👥 관리 대상자
                    </Typography>
                    
                    {loading || seniors.length === 0 ? (
                      <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 1 }}>
                        대상자 정보를 불러오는 중...
                      </Typography>
                    ) : selectedSenior ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                          👤 {selectedSenior.seniorName} 님
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          📍 {selectedSenior.address || '주소 정보 없음'}
                        </Typography>
                        {selectedSenior.phoneNumber && (
                          <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            📞 {selectedSenior.phoneNumber}
                          </Typography>
                        )}
                        {selectedSenior.gender && (
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            👥 {selectedSenior.gender === 'M' ? '남성' : '여성'} · {selectedSenior.birthDate ? `${new Date().getFullYear() - new Date(selectedSenior.birthDate).getFullYear()}세` : '연령 정보 없음'}
                          </Typography>
                        )}
                        
                        {/* 좌우 버튼 */}
                        <Box sx={{                             
                            pt: 1, 
                            borderTop: theme => `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const currentIndex = seniors.findIndex(s => s.id === selectedSenior.id);
                                const prevIndex = currentIndex === 0 ? seniors.length - 1 : currentIndex - 1;
                                handleSeniorSelect(seniors[prevIndex]);
                              }}
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              <ChevronLeft sx={{ color: '#1976d2', fontSize: 18 }} />
                            </IconButton>
                            
                            <Typography variant="caption" sx={{ 
                              color: '#666',
                              minWidth: '40px',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              {seniors.findIndex(s => s.id === selectedSenior.id) + 1} / {seniors.length}
                            </Typography>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const currentIndex = seniors.findIndex(s => s.id === selectedSenior.id);
                                const nextIndex = (currentIndex + 1) % seniors.length;
                                handleSeniorSelect(seniors[nextIndex]);
                              }}
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              <ChevronRight sx={{ color: '#1976d2', fontSize: 18 }} />
                            </IconButton>
                          </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 1 }}>
                        등록된 대상자가 없습니다
                      </Typography>
                    )}
                  </Paper>                  

                  {/* 근처 병원 정보 - 고정 크기 */}
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 1.25,
                    height: '220px', // 완전 고정 높이
                    overflow: 'hidden', // 넘치는 내용 숨김
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2',fontSize: '1.2rem' }}>
                        🏥 근처 병원 정보
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setShowMapModal(true)}
                        sx={{
                          backgroundColor: '#1976d2',
                          fontSize: '0.75rem',
                          py: 0.8,
                          px: 1.8,
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: '#1565c0'
                          }
                        }}
                      >
                        🗺️ 지도
                      </Button>
                    </Box>
                    
                    {hospitalLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flex: 1
                      }}>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                          병원 정보를 불러오는 중...
                        </Typography>
                      </Box>
                    ) : recommendedHospital ? (
                      <Box sx={{ 
                        flex: 1,
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 0.5,
                        overflow: 'hidden'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {getIcon()} {recommendedHospital.yadmNm}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          📍 {recommendedHospital.addr}
                        </Typography>
                        {recommendedHospital.telno && recommendedHospital.telno !== '전화번호 정보 없음' && (
                          <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            📞 {recommendedHospital.telno}
                          </Typography>
                        )}
                        {recommendedHospital.distance && (
                          <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                            📍 거리: {recommendedHospital.distance}
                          </Typography>
                        )}
                        {recommendedHospital.categoryName && (
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            🏷️ {recommendedHospital.categoryName}
                          </Typography>
                        )}

                        
                        {nearbyHospitals.length > 1 && (
                          <Box sx={{
                            mt: 'auto', // 자동으로 하단에 배치
                            pt: 1, 
                            borderTop: theme => `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const currentIndex = nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
                                const prevIndex = currentIndex === 0 ? nearbyHospitals.length - 1 : currentIndex - 1;
                                handleHospitalSelect(nearbyHospitals[prevIndex]);
                              }}
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              <ChevronLeft sx={{ color: '#1976d2', fontSize: 18 }} />
                            </IconButton>
                            
                            <Typography variant="caption" sx={{ 
                              color: '#666',
                              minWidth: '40px',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              {nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm) + 1} / {nearbyHospitals.length}
                            </Typography>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const currentIndex = nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
                                const nextIndex = (currentIndex + 1) % nearbyHospitals.length;
                                handleHospitalSelect(nearbyHospitals[nextIndex]);
                              }}
                              sx={{ 
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0'
                                },
                                width: 32,
                                height: 32
                              }}
                            >
                              <ChevronRight sx={{ color: '#1976d2', fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
                          근처 병원 정보를 찾을 수 없습니다
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* 오른쪽 세로 긴 박스 - 전체 높이 */}
          <Paper sx={{
            width: '320px',
            backgroundColor: '#ffffff',
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '803px',
            overflow: 'hidden',
            boxShadow: 2
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📅 조회 날짜
            </Typography>
            
            {/* 달력 컴포넌트 */}
            <Box sx={{
              marginBottom: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.25,
              padding: 1.25,
              backgroundColor: theme => theme.palette.grey[50],
              flex: '0 0 auto',
              '& .react-calendar': {
                width: '100%',
                border: 'none',
                fontFamily: theme => theme.typography.fontFamily,
                backgroundColor: 'transparent'
              },
              '& .react-calendar__navigation': {
                height: '20px',
                display: 'flex',
                alignItems: 'center'
              },
              '& .react-calendar__navigation button': {
                minWidth: '32px',
                height: '44px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: theme => theme.palette.primary.main,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                transition: theme => theme.transitions.create(['background-color'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.main,
                  color: 'white'
                },
                '&:disabled': {
                  color: theme => theme.palette.text.disabled
                }
              },
              '& .react-calendar__navigation__label': {
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                flex: 1,
                color: theme => theme.palette.text.primary
              },
              '& .react-calendar__month-view__weekdays': {
                borderBottom: theme => `1px solid ${theme.palette.divider}`,
                paddingBottom: 0.625,
                marginBottom: 0.625,
                display: 'flex',
                justifyContent: 'space-between'
              },
              '& .react-calendar__month-view__weekdays__weekday': {
                padding: 0.5,
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: theme => theme.palette.text.secondary,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '35px',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              },
              '& .react-calendar__tile': {
                padding: 1,
                fontSize: '0.85rem',
                border: theme => `1px solid ${theme.palette.grey[200]}`,
                backgroundColor: 'white',
                minHeight: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: theme => theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.light,
                  color: 'white'
                }
              },
              '& .react-calendar__tile--active': {
                backgroundColor: theme => `${theme.palette.primary.main} !important`,
                color: 'white',
                border: theme => `1px solid ${theme.palette.primary.main}`
              },
              '& .react-calendar__tile--active:enabled:hover': {
                backgroundColor: theme => `${theme.palette.primary.dark} !important`
              },
              '& .react-calendar__tile--active:enabled:focus': {
                color: 'white',
              },              
              '& .react-calendar__tile--now': {
                backgroundColor: theme => theme.palette.primary.light,
                color: 'white',
                border: theme => `1px solid ${theme.palette.primary.main}`
              },
              '& .react-calendar__tile--now:enabled:focus': {
                backgroundColor: theme => theme.palette.primary.light,
                color: 'white'
              }
            }}>
              <Calendar
                onChange={(date) => {
                  console.log('📅 달력에서 날짜 선택:', date);
                  console.log('📅 날짜 문자열:', getLocalDateString(date));
                  console.log('📅 현재 selectedSenior:', selectedSenior);
                  console.log('📅 현재 vitalSignsData:', vitalSignsData);
                  loadDataForDate(date); // 선택된 날짜 데이터 로드
                }}
                value={selectedDate}
                locale="ko-KR"
                formatShortWeekday={(locale, date) => {
                  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                  return weekdays[date.getDay()];
                }}
                formatDay={(locale, date) => date.getDate().toString()}
              />
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🌦️ 오늘 날씨 ({formattedDate})
            </Typography>
            <Box sx={{ 
              flex: 1,
              border: theme => `1px solid ${theme.palette.divider}`,
              borderRadius: 1.25,
              padding: 1.25,
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.625,
              overflow: 'hidden',
              minHeight: 0
            }}>
              {/* 위치 정보 */}
              <Box sx={{ 
                textAlign: 'center',
                mb: 0.2
              }}>
                <Typography variant="body1" sx={{ 
                  color: '#666', 
                  fontWeight: 'bold', 
                  fontSize: '1.8rem' 
                }}>
                  {weather.location}
                </Typography>
              </Box>
              
              {/* 메인 날씨 정보 - 가로 배치 */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3.125,
                mb: 1
              }}>
                {/* 온도 정보 (현재 + 최고/최저) */}
                <Box sx={{ textAlign: 'center', flex: 1.5 }}>
                  <Typography variant="h3" sx={{ 
                    fontSize: '50px',
                    color: '#1976d2', 
                    fontWeight: 'bold', 
                    mb: 1 
                  }}>
                    {weather.temperature}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.625 }}>
                    <Typography variant="body2" sx={{
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      color: '#d32f2f'
                    }}>
                      최고 {weather.maxTemp}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontSize: '20px', 
                      color: '#1976d2'
                    }}>
                      최저 {weather.minTemp}
                    </Typography>
                  </Box>
                </Box>
                
                {/* 날씨 아이콘 + 상태 + 습도 */}
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  {weather.icon && (
                    <Box sx={{
                      width: 70,
                      height: 70,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: theme => `1px solid ${theme.palette.divider}`,
                      margin: '0 auto 8px auto'
                    }}>
                      <img 
                        src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                        alt={weather.condition}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ 
                    fontSize: '1.2rem',
                    color: '#333', 
                    mb: 0, 
                    fontWeight: 'bold' 
                  }}>
                    {weather.condition}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#666',
                    fontSize: '0.9rem',
                  }}>
                    습도: {weather.humidity}
                  </Typography>
                </Box>
              </Box>
              
              {/* 4일간 예보 - 가로 배치 */}
              {weather.weeklyForecast && weather.weeklyForecast.length > 0 && (
                <Box sx={{ 
                  pt: 2,
                  borderTop: theme => `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mb: 1.5, 
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1rem'
                  }}>
                    4일간 예보
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1
                  }}>
                    {weather.weeklyForecast.map((forecast, index) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 1,
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent',
                        borderRadius: 1
                      }}>
                        {/* 요일 */}
                        <Typography variant="caption" sx={{ 
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '0.75rem',
                          mb: 0.5
                        }}>
                          {forecast.day}
                        </Typography>
                        
                        {/* 날씨 아이콘 */}
                        <Box sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          border: theme => `1px solid ${theme.palette.divider}`,
                          margin: '0 auto 4px auto'
                        }}>
                          <img 
                            src={`https://openweathermap.org/img/wn/${getColoredIcon(forecast.icon)}@4x.png`}
                            alt={forecast.condition}
                            title={forecast.condition}
                            style={{
                              width: '24px',
                              height: '24px',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                        
                        {/* 온도 */}
                        <Typography variant="caption" sx={{ 
                          fontWeight: 'bold',
                          color: '#d32f2f',
                          fontSize: '0.9rem'
                        }}>
                          {forecast.maxTemp}°
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#1976d2',
                          fontSize: '0.9rem'
                        }}>
                          {forecast.minTemp}°
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* API 출처 표시 */}
              <Box sx={{ 
                textAlign: 'center',                
                borderTop: theme => `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#999',
                  fontSize: '0.65rem',
                  fontStyle: 'italic'
                }}>
                  Powered by{' '}
                  <Box
                    component="a"
                    href="https://openweathermap.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    OpenWeatherMap
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Paper>
      
      {/* 병원 지도 모달 */}
      <HospitalMapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        hospitals={recommendedHospital ? [recommendedHospital] : []} // 현재 선택된 병원만 전달
        currentPosition={currentPosition}
      />
    </Box>
  );
};

export default Home; 