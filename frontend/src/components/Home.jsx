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
  NotificationsOutlined,
  EventOutlined,
  MessageOutlined,
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
import { getWeatherInfo } from '../utils/weatherAPI';
import Calendar from 'react-calendar';
// API 클라이언트 import로 axios 대체 (2025.07.08)
import { getSeniorsForDate, getAllSeniors, getSeniorDailyActivities, getScheduleDropdownItems } from '../api/apiClient';
// 카카오 API 유틸리티 import (2025.07.08)
import { searchAddressToCoord } from '../utils/kakaoAPI';
import { getUserInfo, clearAuthData, getAuthToken } from '../utils/auth';

const Home = () => {
  const navigate = useNavigate();
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
    location: '부산',
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
    { text: '회원정보 관리', icon: EditOutlined, path: '/profile/management', lastUsed: new Date('2025-07-04T10:20:00') },
    { text: '보호 대상자 관리', icon: PeopleOutlined, path: '/seniors', lastUsed: new Date('2025-07-04T09:15:00') },
    { text: '안전 모니터링', icon: SecurityOutlined, path: '/monitoring', lastUsed: new Date('2025-07-03T16:30:00') },
    { text: '알림 설정', icon: SettingsOutlined, path: '/notifications', lastUsed: new Date('2025-07-03T14:20:00') }
  ]);
  
  const [recommendedHospital, setRecommendedHospital] = useState(null);
  
  const [busanHospitals, setBusanHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [seniors, setSeniors] = useState([]); // 보호 대상자 목록
  const [selectedSenior, setSelectedSenior] = useState(null); // 선택된 보호 대상자
  const [todaySchedule, setTodaySchedule] = useState([]); // 오늘의 할 일 목록
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // 오늘의 할 일 로드
  const loadTodaySchedule = async () => {
    try {
      setScheduleLoading(true);
      console.log('오늘의 할 일 로드 시작');
      
      const scheduleItems = await getScheduleDropdownItems();
      console.log('로드된 일정 항목들:', scheduleItems);
      
      // 기본 내용이 비어있으면 샘플 데이터 사용
      if (!scheduleItems || scheduleItems.length === 0) {
        setTodaySchedule([
          { id: 1, text: '정기 건강 체크', completed: false },
          { id: 2, text: '약물 복용 확인', completed: false },
          { id: 3, text: '안전 확인 전화', completed: true },
          { id: 4, text: '식사 메뉴 준비', completed: false }
        ]);
      } else {
        // API에서 가져온 데이터를 할 일 형식으로 변환
        const formattedSchedule = scheduleItems.map((item, index) => ({
          id: index + 1,
          text: item,
          completed: Math.random() > 0.8 // 가끔 완료된 항목
        }));
        setTodaySchedule(formattedSchedule);
      }
      
    } catch (error) {
      console.error('오늘의 할 일 로드 오류:', error);
      // 오류 시 기본 데이터 사용
      setTodaySchedule([
        { id: 1, text: '정기 건강 체크', completed: false },
        { id: 2, text: '약물 복용 확인', completed: false },
        { id: 3, text: '안전 확인 전화', completed: true }
      ]);
    } finally {
      setScheduleLoading(false);
    }
  };
  
  // 할 일 완료 상태 토글
  const toggleScheduleItem = (id) => {
    setTodaySchedule(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      const response = await getAllSeniors();
      console.log('getAllSeniors API 응답:', response);
      const seniorsList = response.content || [];
      console.log('로드된 Senior 목록:', seniorsList);
      setSeniors(seniorsList);
      
      // 첫 번째 Senior를 기본 선택
      if (seniorsList.length > 0 && !selectedSenior) {
        setSelectedSenior(seniorsList[0]);
        // 선택된 Senior의 주소로 병원 검색
        if (seniorsList[0].address) {
          loadHospitalsByAddress(seniorsList[0].address);
        }
      }
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    }
  };
  
  const handleHospitalSelect = (hospital) => {
    setRecommendedHospital(hospital);
    console.log('병원 선택 완료:', hospital.yadmNm);
  };
  
  // 주소 기반 병원 검색
  const loadHospitalsByAddress = async (address) => {
    try {
      console.log('loadHospitalsByAddress 호출, 주소:', address);
      setHospitalLoading(true);
      
      // 주소를 좌표로 변환
      console.log('좌표 변환 시도할 주소:', address);
      
      // 아파트명이 포함된 경우 제거하고 시도
      let searchAddress = address;
      const apartmentMatch = address.match(/(.+구\s+.+동)\s+.*/);  // 구와 동까지만 추출
      if (apartmentMatch) {
        searchAddress = apartmentMatch[1];
        console.log('간략화된 주소로 재시도:', searchAddress);
      }
      
      let result = await searchAddressToCoord(searchAddress);
      
      // 첫 번째 시도 실패 시 더 간략한 주소로 재시도
      if (!result.success && searchAddress !== address) {
        const simpleAddress = address.split(' ').slice(0, 3).join(' ');  // 시 구 동까지만
        console.log('더 간략한 주소로 재시도:', simpleAddress);
        result = await searchAddressToCoord(simpleAddress);
      }
      
      console.log('좌표 변환 결과:', result);
      
      if (result.success) {
        console.log(`${address} 좌표:`, result.y, result.x);
        
        // 해당 좌표로 병원 검색
        const hospitalResult = await searchNearbyHospitals(result.y, result.x);
        
        if (hospitalResult.success && hospitalResult.places) {
          const kakaoHospitals = hospitalResult.places.map(place => ({
            yadmNm: place.name,
            telno: place.phone || '전화번호 정보 없음',
            addr: place.roadAddress || place.address,
            distance: place.distance ? (place.distance >= 1000 ? `${(place.distance / 1000).toFixed(1)}km` : `${Math.round(place.distance)}m`) : '',
            categoryName: place.category,
            latitude: place.y,
            longitude: place.x
          }));
          
          setBusanHospitals(kakaoHospitals);
          setRecommendedHospital(kakaoHospitals[0]);
          
          // Senior의 위치를 currentPosition으로 설정
          setCurrentPosition({
            latitude: result.y,
            longitude: result.x,
            address: address,
            isSeniorLocation: true
          });
        }
      } else {
        console.warn('주소를 좌표로 변환할 수 없습니다.');
        // 기본값으로 현재 위치 사용
        loadRecommendedHospital();
      }
    } catch (error) {
      console.error('주소 기반 병원 검색 오류:', error);
      // 기본값으로 현재 위치 사용
      loadRecommendedHospital();
    } finally {
      setHospitalLoading(false);
    }
  };
  
  const loadRecommendedHospital = async () => {
    try {
      console.log('추천 병원 조회 시작');
      setHospitalLoading(true);
      
      const position = await getCurrentPosition();
      const { latitude, longitude } = position;
      setCurrentPosition(position);
      
      console.log('현재 위치:', position);
      console.log('위도:', latitude, '경도:', longitude);
      
      if (position.isDefault) {
        console.log('기본 위치 사용 중 (부산시청)');
      }
      
      const result = await searchNearbyHospitals(latitude, longitude);
      
      console.log('카카오 병원 검색 결과:', result);
      
      if (result.success && result.places && result.places.length > 0) {
        const kakaoHospitals = result.places.map(place => ({
        yadmNm: place.name,
        telno: place.phone || '전화번호 정보 없음',
        addr: place.roadAddress || place.address,
        distance: place.distance ? (place.distance >= 1000 ? `${(place.distance / 1000).toFixed(1)}km` : `${Math.round(place.distance)}m`) : '',
        categoryName: place.category,
        latitude: place.y,
        longitude: place.x
      }));
        
        setBusanHospitals(kakaoHospitals);
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
  
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        // 부산 시청 기본 좌표
        resolve({
          latitude: 35.1796,
          longitude: 129.0756,
          isDefault: true
        });
        return;
      }
      
      console.log('위치 정보 요청 중...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('위치 정보 획득 성공:', position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isDefault: false
          });
        },
        (error) => {
          console.error('위치 권한 오류:', error);
          console.error('에러 코드:', error.code);
          console.error('에러 메시지:', error.message);
          
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              break;
            default:
              errorMessage = '알 수 없는 오류가 발생했습니다.';
          }
          
          alert(`위치 정보 오류: ${errorMessage}\n부산 시청 위치로 대체합니다.`);
          
          // 부산 시청 기본 좌표
          resolve({
            latitude: 35.1796,
            longitude: 129.0756,
            isDefault: true
          });
        },
        {
          enableHighAccuracy: true,  // 높은 정확도
          timeout: 10000,             // 10초 타임아웃
          maximumAge: 0               // 캐시 사용 안함 (항상 새로운 위치)
        }
      );
    });
  };
  
  const searchNearbyHospitals = async (latitude, longitude) => {
    try {
      const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
      
      if (!REST_API_KEY) {
        throw new Error('카카오 API 키가 설정되지 않았습니다.');
      }
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=HP8&x=${longitude}&y=${latitude}&radius=5000&sort=distance`,
        {
          headers: {
            'Authorization': `KakaoAK ${REST_API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`카카오 API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        places: data.documents.map(place => ({
          name: place.place_name,
          phone: place.phone,
          address: place.address_name,
          roadAddress: place.road_address_name,
          distance: place.distance,
          category: place.category_name,
          x: place.x,
          y: place.y
        }))
      };
    } catch (error) {
      console.error('카카오 병원 검색 API 오류:', error);
      return { success: false, places: [] };
    }
  };
  
  // Senior 선택 핸들러
  const handleSeniorSelect = (senior) => {
    console.log('선택된 Senior:', senior);
    console.log('Senior 주소:', senior.address);
    setSelectedSenior(senior);
    if (senior.address) {
      loadHospitalsByAddress(senior.address);
    } else {
      // 주소가 없는 경우 현재 위치 사용
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
  
  const handleQuickActionClick = (action) => {
    updateRecentAction(action.text);
    
    if (action.path) {
      if (action.path.startsWith('/')) {
        navigate(action.path);
      } else {
        console.log(`${action.text} 클릭됨 - 기능 준비 중`);
      }
    }
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
    
    loadDataForDate(new Date());
    loadWeatherData();
    loadSeniors(); // 보호 대상자 목록 로드
    loadTodaySchedule(); // 오늘의 할 일 로드
  }, []);
  
  const loadDataForDate = async (date) => {
    console.log('선택된 날짜:', date);
    await Promise.all([
      loadSeniorDataForDate(date),
      loadRecentActivitiesForDate(date)
    ]);
  };
  
  const loadSeniorDataForDate = async (date) => {
    try {
      setLoading(true);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
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
      console.log('날씨 정보 로드 시작');
      
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
      }
      
      const weatherData = await getWeatherInfo(apiKey);
      
      console.log('날씨 데이터:', weatherData);
      
      setWeather(weatherData);
      
    } catch (error) {
      console.error('날씨 정보 로드 오류:', error);
      
      setWeather({
        temperature: '22°C',
        condition: '맑음',
        humidity: '65%',
        location: '부산',
        maxTemp: '25°C',
        minTemp: '18°C'
      });
    }
  };
  
  const loadRecentActivitiesForDate = async (date) => {
    try {
      setActivitiesLoading(true);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('Activities API 호출 날짜:', dateString);
      
      const seniorsResponse = await getAllSeniors();
      
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

  const handleLogout = () => {
    clearAuthData();
    
    alert('로그아웃 되었습니다.');
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('authStateChange'));
    window.location.reload();
  };

  const menuItems = [
    { text: '홈', icon: DashboardOutlined },
    { text: '회원정보 관리', icon: EditOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '안전 모니터링', icon: SecurityOutlined },
    { text: '알림 센터', icon: NotificationsOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '메시지', icon: MessageOutlined }
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
        boxShadow: 10
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
        margin: '1vw 1vw 1vw 240px',
        height: 'calc(100vh - 2vw)',
        minHeight: 'calc(100vh - 2vw)',
        borderRadius: 1,
        boxShadow: 3
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
                  📊 시스템 현황
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
                  📋 최근 활동 현황
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
                  📊 오늘의 요약
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* 관리 대상자 */}
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1.25 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
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
                            mt: 1, 
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

                  {/* 추천 주변 병원 정보 */}
                  <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2',fontSize: '1.2rem' }}>
                        🏥 추천 주변 병원
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
                      <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 1 }}>
                        병원 정보를 불러오는 중...
                      </Typography>
                    ) : recommendedHospital ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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

                        
                        {busanHospitals.length > 1 && (
                          <Box sx={{ 
                            mt: 1, 
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
                                const currentIndex = busanHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
                                const prevIndex = currentIndex === 0 ? busanHospitals.length - 1 : currentIndex - 1;
                                handleHospitalSelect(busanHospitals[prevIndex]);
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
                              {busanHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm) + 1} / {busanHospitals.length}
                            </Typography>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                const currentIndex = busanHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
                                const nextIndex = (currentIndex + 1) % busanHospitals.length;
                                handleHospitalSelect(busanHospitals[nextIndex]);
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
                      <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 1, fontStyle: 'italic' }}>
                        근처 병원 정보를 찾을 수 없습니다
                      </Typography>
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
              📅 일정 관리
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
                  console.log('달력에서 선택된 날짜:', date);
                  setSelectedDate(date);
                  loadDataForDate(date);
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

            <Typography variant="body1" fontWeight="bold" gutterBottom>
              🌦️ 오늘 날씨
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
                mb: 1
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
                            src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
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
        hospitals={busanHospitals}
        currentPosition={currentPosition}
      />
    </Box>
  );
};

export default Home; 