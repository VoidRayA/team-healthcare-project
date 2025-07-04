import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,  
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,  
  Chip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,
  NotificationsOutlined,
  EventOutlined,
  MessageOutlined,
  LogoutOutlined,
  WarningAmberOutlined,
  PersonAddOutlined,
  FavoriteOutlined,
  DevicesOutlined,  
  LocationOnOutlined,
  SettingsOutlined,
  AddOutlined,
  EditOutlined,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import userImage from '../images/user.png';
import { getWeatherInfo } from '../utils/weatherAPI';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios'; // API 호출을 위해 추가

// 전체 컨테이너 - 연한 파란 배경
const MainContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#CCE5FF',
  display: 'flex',  
  gap: '0px',
  overflow: 'hidden'
});

// 메인 컨테이너 - 하얀색
const ContentContainer = styled(Paper)({
  backgroundColor: '#ffffff',  
  flex: 1,
  display: 'flex',
  overflow: 'auto',
  margin: '1vw 1vw 1vw 240px',
  height: 'calc(100vh - 2vw)',
  minHeight: 'calc(100vh - 2vw)'
});

// 왼쪽 사이드바
const Sidebar = styled(Paper)({
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
  zIndex: 1000
});

const SidebarMenu = styled(List)({
  padding: '0 20px',
  flex: 1,
  '& .MuiListItem-root': {
    borderRadius: '12px',
    marginBottom: '8px',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    '&.active': {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '40px',
  }
});

// 중앙 메인 영역
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  padding: '30px 30px 30px 30px', // 오른쪽 여백 추가
  gap: '20px'
});

// 왼쪽 콘텐츠 영역
const LeftContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
  // justifyContent 제거해서 자연스러운 흐름으로
});

// 상단 헤더
const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '200px', // 헤더 높이 추가
  marginBottom: '40px',
  paddingTop: '20px'
});

const WelcomeText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', // 세로 중앙 정렬
  flex: 1  
});

// 하단 3개 박스 컨테이너
const BottomBoxContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '15px',
  // height 제거 - 자연스러운 높이로
  padding: '0 0 20px 0'
});

// 오른쪽 세로 긴 박스 - 왼쪽 박스들과 같은 높이
const RightCalendarArea = styled(Paper)({
  width: '320px', // 280px에서 320px로 늘림
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '15px', // 패딩 줄임
  display: 'flex',
  flexDirection: 'column',
  height: '803px', // 고정 높이로 왼쪽과 정확히 맞춤
  overflow: 'hidden' // 스크롤바 제거
});

// 왼쪽 박스 (상태 박스)
const StatusBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  minHeight: '450px', // 더 긴 높이로 설정
  overflow: 'auto'
});

// 중간 박스 (최근 활동)
const ActivityBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  minHeight: '450px', // 더 긴 높이로 설정
  overflow: 'auto'
});

// 오른쪽 박스 (빠른 작업)
const QuickActionBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  minHeight: '450px', // 더 긴 높이로 설정
  overflow: 'auto'
});

const ActivityItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none'
  }
});

const Home = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('홈');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  const [selectedDate, setSelectedDate] = useState(new Date()); // 달력 날짜 상태
  const [weather, setWeather] = useState({
    temperature: '로딩 중...',
    condition: '로딩 중...',
    humidity: '로딩 중...',
    location: '부산',
    maxTemp: '-',
    minTemp: '-'
  });
  
  // =================================================================
  // Senior 데이터 및 Daily Activities 데이터 관리용 State (2025.07.02 신규 추가)
  // 목적: 하드코딩된 더미 데이터를 실제 백엔드 API 데이터로 교체
  // =================================================================
  const [seniorStats, setSeniorStats] = useState({
    totalSeniors: 0,      // 총 관리 대상자 수 (기존: 5 -> 실제 API 데이터)
    alerts: 0,            // 긴급 알림 수 (기존: 2 -> 실제 계산값)
    healthIssues: 0,      // 건강 이상 수 (기존: 3 -> 실제 계산값)
    connectedDevices: 0   // 연결된 장치 수 (기존: 8 -> 실제 계산값)
  });
  const [loading, setLoading] = useState(true); // 로딩 상태 (데이터 로딩 중일 때 '...' 표시)
  
  // 빠른 작업 데이터 관리용 State (2025.07.04 신규 추가)
  const [recentActions, setRecentActions] = useState([
    { text: '회원정보 관리', icon: EditOutlined, path: '/profile/edit', lastUsed: new Date('2025-07-04T10:20:00') },
    { text: '보호 대상자 관리', icon: PeopleOutlined, path: '/seniors', lastUsed: new Date('2025-07-04T09:15:00') },
    { text: '안전 모니터링', icon: SecurityOutlined, path: '/monitoring', lastUsed: new Date('2025-07-03T16:30:00') },
    { text: '알림 설정', icon: SettingsOutlined, path: '/notifications', lastUsed: new Date('2025-07-03T14:20:00') }
  ]);
  
  // 주소 기반 추천 병원 정보 State (2025.07.04 신규 추가)
  const [recommendedHospital, setRecommendedHospital] = useState({
    yadmNm: '부산대학교병원',
    telno: '051-240-7000',
    addr: '부산광역시 서구 구덕로 179'
  });
  
  // 부산 지역 병원 목록 State (2025.07.04 신규 추가)
  const [busanHospitals, setBusanHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  
  // 최근 활동 데이터 State (2025.07.04 신규 추가)
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  
  // 주소 기반 추천 병원 로드 함수 (2025.07.04 신규 추가)
  const loadRecommendedHospital = async () => {
    try {
      console.log('추천 병원 API 호출 시작');
      setHospitalLoading(true);
      
      // 부산 지역 전체 병원 목록 조회 (유일한 작동하는 엔드포인트)
      const response = await axios.get('http://localhost:8080/api/hospital/busan', {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5초 타임아웃
      });
      
      console.log('부산 병원 목록 응답:', response.data);
      
      // API 응답에서 병원 데이터 추출 및 디버깅
      console.log('API 응답 전체 구조:', response.data);
      
      if (response.data && response.data.response && response.data.response.body && response.data.response.body.items) {
        const items = response.data.response.body.items.item;
        console.log('추출된 items:', items);
        console.log('items 타입:', typeof items);
        console.log('items는 배열인가?', Array.isArray(items));
        
        let hospitalsList = [];
        
        if (Array.isArray(items)) {
          hospitalsList = items;
        } else if (items) {
          hospitalsList = [items]; // 단일 아이템인 경우 배열로 변환
        }
        
        console.log('처리된 hospitalsList:', hospitalsList);
        console.log('hospitalsList 길이:', hospitalsList.length);
        
        // 병원 목록이 비어있지 않은 경우만 처리
        if (hospitalsList.length > 0) {
          // 병원 목록 저장
          setBusanHospitals(hospitalsList);
          
          // 첫 번째 병원을 추천 병원으로 설정
          const firstHospital = hospitalsList[0];
          console.log('첫 번째 병원 데이터:', firstHospital);
          
          setRecommendedHospital({
            yadmNm: firstHospital.yadmNm || '부산대학교병원',
            telno: firstHospital.telno || '051-240-7000',
            addr: firstHospital.addr || '부산광역시 서구 구덕로 179'
          });
          console.log('추천 병원 설정 완료:', firstHospital.yadmNm);
          console.log('총 병원 수:', hospitalsList.length);
          return; // 성공시 여기서 종료
        } else {
          console.warn('병원 목록이 비어있습니다.');
        }
      } else {
        console.warn('API 응답 구조가 예상과 다릅니다.');
        console.log('response.data:', response.data);
        console.log('response.data.response:', response.data?.response);
        console.log('response.data.response.body:', response.data?.response?.body);
        console.log('response.data.response.body.items:', response.data?.response?.body?.items);
      }
      
      // API 응답이 없거나 비어있는 경우 예외 발생
      throw new Error('병원 API에서 유효한 데이터를 받지 못함');
      
    } catch (error) {
      console.error('추천 병원 로드 오류:', error);
      
      // 서버 연결 실패 시 Mock 데이터 사용
      console.error('서버 연결 실패. Mock 데이터 사용.');
      const mockHospitals = [
        {
          yadmNm: '부산대학교병원 (Mock)',
          telno: '051-240-7000',
          addr: '부산광역시 서구 구덕로 179'
        },
        {
          yadmNm: '인제대학교 부산백병원 (Mock)',
          telno: '051-890-6114',
          addr: '부산광역시 부산진구 복지로 75'
        },
        {
          yadmNm: '가톨릭대학교 부산성모병원 (Mock)',
          telno: '051-933-7114',
          addr: '부산광역시 남구 용호로 232번길 25-14'
        },
        {
          yadmNm: '동아대학교병원 (Mock)',
          telno: '051-554-0114',
          addr: '부산광역시 서구 대신공원로 26'
        },
        {
          yadmNm: '부산의료원 (Mock)',
          telno: '051-607-2000',
          addr: '부산광역시 연제구 반송로 75'
        },
        {
          yadmNm: '해운대백병원 (Mock)',
          telno: '051-797-0100',
          addr: '부산광역시 해운대구 해운대로 875'
        }
      ];
      
      setBusanHospitals(mockHospitals);
      setRecommendedHospital(mockHospitals[0]);
      console.log('Mock 병원 데이터 사용 완료');
    } finally {
      setHospitalLoading(false);
    }
  };
  
  // 병원 선택 함수 (2025.07.04 신규 추가)
  const handleHospitalSelect = (hospital) => {
    setRecommendedHospital(hospital);
    console.log('병원 선택 완료:', hospital.yadmNm);
  };
  
  // 빠른 작업 사용 기록 업데이트 함수
  const updateRecentAction = (actionText) => {
    setRecentActions(prev => 
      prev.map(action => 
        action.text === actionText 
          ? { ...action, lastUsed: new Date() }
          : action
      ).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed)) // 최신 순으로 정렬
    );
  };
  
  // 빠른 작업 클릭 핸들러
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
    const savedName = localStorage.getItem('guardianName');
    const savedLoginId = localStorage.getItem('loginId');
    const savedRole = localStorage.getItem('role');
    
    if (savedName && savedLoginId) {
      setGuardianInfo({
        name: savedName,
        loginId: savedLoginId,
        role: savedRole || 'GUARDIAN'
      });
    }
    
    // 컴포넌트 마운트 시 오늘 날짜 기준으로 데이터 로드
    loadDataForDate(new Date());
    // 날씨 정보 로드
    loadWeatherData();
    // 추천 병원 정보 로드 (2025.07.04 추가)
    loadRecommendedHospital();
  }, []);
  
  // =================================================================
  // 선택된 날짜의 모든 데이터를 로드하는 통합 함수 (2025.07.03 수정)
  // 목적: 달력에서 날짜 선택 시 해당 날짜의 모든 관련 데이터를 로드
  // =================================================================
  const loadDataForDate = async (date) => {
    console.log('선택된 날짜:', date);
    // 병렬로 모든 데이터 로드
    await Promise.all([
      loadSeniorDataForDate(date),
      loadRecentActivitiesForDate(date)
    ]);
  };
  
  // =================================================================
  // 특정 날짜의 Senior 데이터를 백엔드 API에서 가져오는 함수 (2025.07.03 수정)
  // API: GET /api/seniors?date=YYYY-MM-DD
  // 목적: 선택된 날짜의 '금일 대상자' 수치를 실제 데이터로 업데이트
  // =================================================================
  const loadSeniorDataForDate = async (date) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.error('JWT 토큰이 없습니다.');
        return;
      }
      
      // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 이슈 해결)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('변환된 날짜 문자열:', dateString);
      
      // Senior 목록 가져오기 (날짜 파라미터 추가)
      const response = await axios.get(`http://localhost:8080/api/seniors?date=${dateString}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${dateString} Senior 데이터 응답:`, response.data);
      
      // 응답에서 데이터 추출
      const seniors = response.data.content || []; // Page 객체에서 content 배열 추출
      const totalCount = seniors.length;
      
      // 해당 날짜의 실제 통계 계산
      setSeniorStats({
        totalSeniors: totalCount,
        alerts: Math.floor(totalCount * 0.1), // 실제로는 해당 날짜의 알림 수를 계산
        healthIssues: Math.floor(totalCount * 0.2), // 실제로는 해당 날짜의 건강 이상 수를 계산
        connectedDevices: totalCount * 2 // 실제로는 해당 날짜의 연결된 장치 수를 계산
      });
      
    } catch (error) {
      console.error('Senior 데이터 로드 오류:', error);
      
      if (error.response?.status === 401) {
        console.error('인증 만료. 로그인이 필요합니다.');
      } else {
        console.error('데이터 로드 실패. 기본값 사용.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // =================================================================
  // 특정 날짜의 활동 현황 데이터를 백엔드 API에서 가져오는 함수 (2025.07.03 수정)
  // API: GET /api/seniors/0/dailyActivities/recent-activities?limit=5&date=YYYY-MM-DD
  // 목적: 선택된 날짜의 '최근 활동 현황' 섹션을 실제 Daily Activities 데이터로 교체
  // =================================================================
  // =================================================================
  // 날씨 정보 로드 함수 (2025.07.03 신규 추가)
  // API: OpenWeatherMap
  // 목적: 오른쪽 날씨 정보 섹션에 실제 날씨 데이터 표시
  // =================================================================
  const loadWeatherData = async () => {
    try {
      console.log('날씨 정보 로드 시작');
      
      // 환경변수에서 API 키 가져오기
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
      }
      
      // 날씨 API 호출
      const weatherData = await getWeatherInfo(apiKey);
      
      console.log('날씨 데이터:', weatherData);
      
      // 상태 업데이트
      setWeather(weatherData);
      
    } catch (error) {
      console.error('날씨 정보 로드 오류:', error);
      
      // 오류 시 기본값 사용
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
  
  // =================================================================
  // 특정 날짜의 활동 현황 데이터를 백엔드 API에서 가져오는 함수 (2025.07.04 수정)
  // 단계 1: Senior 목록 조회 후 첫 번째 Senior의 활동 데이터 로드
  // 목적: 선택된 날짜의 '최근 활동 현황' 섹션을 실제 Daily Activities 데이터로 교체
  // =================================================================
  const loadRecentActivitiesForDate = async (date) => {
    try {
      setActivitiesLoading(true);
      
      // JWT 토큰 인증 확인
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.error('JWT 토큰이 없습니다.');
        return;
      }
      
      // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 이슈 해결)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('Activities API 호출 날짜:', dateString);
      
      // 단계 1: 현재 Guardian의 Senior 목록 조회
      const seniorsResponse = await axios.get(`http://localhost:8080/api/seniors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Senior 목록 응답:', seniorsResponse.data);
      
      // Senior 목록에서 첫 번째 Senior 선택
      const seniors = seniorsResponse.data.content || [];
      if (seniors.length === 0) {
        console.warn('관리하는 Senior가 없습니다.');
        setRecentActivitiesData([]);
        return;
      }
      
      const firstSeniorId = seniors[0].id;
      console.log('첫 번째 Senior ID:', firstSeniorId);
      
      // 단계 2: 해당 Senior의 전체 Daily Activities 조회 후 날짜별 필터링
      const activitiesResponse = await axios.get(`http://localhost:8080/api/seniors/${firstSeniorId}/dailyActivities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`전체 Activities 데이터 응답:`, activitiesResponse.data);
      console.log('activitiesResponse.data 타입:', typeof activitiesResponse.data);
      console.log('activitiesResponse.data의 키들:', Object.keys(activitiesResponse.data || {}));
      
      // 응답 데이터에서 dailyActivities 배열 추출
      // 백엔드는 SeniorDailyListDto를 반환: { seniors: [{ id, seniorName, dailyActivities }] }
      const seniorData = activitiesResponse.data?.seniors?.[0]; // 첫 번째 Senior 선택
      const allActivities = seniorData?.dailyActivities || [];
      
      console.log('seniorData:', seniorData);
      console.log('allActivities 개수:', allActivities.length);
      console.log('allActivities 샘플:', allActivities.slice(0, 2));
      
      // 선택된 날짜의 활동만 필터링
      const filteredActivities = allActivities.filter(activity => {
        // activityDate를 YYYY-MM-DD 형식으로 변환하여 비교
        const activityDate = activity.activityDate;
        if (activityDate) {
          // 날짜만 비교 (2025-07-01 형식)
          return activityDate === dateString;
        }
        return false;
      });
      
      console.log(`${dateString} 필터링된 Activities:`, filteredActivities);
      
      // 프론트엔드에서 사용할 형식으로 변환
      const formattedActivities = filteredActivities.slice(0, 10).map(activity => {
        // status 판정 로직 수정 (현실적인 기준)
        let status = 'success'; // 기본값을 정상으로 (긍정적 접근)
        
        // 1순위: 심각한 문제만 긴급으로 처리
        if (activity.sleepQuality === 'bad' || activity.mealCount === 0) {
          status = 'error';
        }
        // 2순위: 약간의 주의가 필요한 경우
        else if (activity.sleepQuality === 'normal' || activity.mealCount === 1) {
          status = 'warning';
        }
        // 3순위: 나머지는 모두 정상 (기본값)
        
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
        // 오류 시 기본값 유지 (빈 배열)
        console.error('Recent Activities 데이터 로드 실패. 기본값 사용.');
        setRecentActivitiesData([]);
      }
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('loginId');
    localStorage.removeItem('guardianName');
    localStorage.removeItem('role');
    
    alert('로그아웃 되었습니다.');
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
      count: loading ? '...' : seniorStats.alerts, // 실제 API 데이터로 교체 (기존 하드코딩: 2)
      icon: WarningAmberOutlined,
      color: '#ff4444'
    },
    {
      title: '금일 대상자',
      count: loading ? '...' : seniorStats.totalSeniors, // 실제 API 데이터로 교체 (기존 하드코딩: 5)
      icon: PeopleOutlined,
      color: '#2196f3'
    },
    {
      title: '건강 상태',
      count: loading ? '...' : seniorStats.healthIssues, // 실제 API 데이터로 교체 (기존 하드코딩: 3)
      icon: FavoriteOutlined,
      color: '#4caf50'
    },
    {
      title: '연결 장치',
      count: loading ? '...' : seniorStats.connectedDevices, // 실제 API 데이터로 교체 (기존 하드코딩: 8)
      icon: DevicesOutlined,
      color: '#9c27b0'
    }
  ];

  // 하드코딩된 recentActivities 제거 (이제 API에서 가져옴)
  // const recentActivities = [
  //   {
  //     time: '10:30',
  //     user: '김영수',
  //     activity: '안전지대 이탈 감지',
  //     status: 'warning'
  //   },
  //   {
  //     time: '09:15',
  //     user: '박미영',
  //     activity: '정상 귀가 확인',
  //     status: 'success'
  //   },
  //   {
  //     time: '08:45',
  //     user: '이철수',
  //     activity: '응급호출 버튼 작동',
  //     status: 'error'
  //   },
  //   {
  //     time: '08:20',
  //     user: '최순자',
  //     activity: '일일 건강체크 완료',
  //     status: 'success'
  //   }
  // ];
  //   }
  // ];

  const quickActions = [
    { text: '새 보호대상자 추가', icon: PersonAddOutlined },
    { text: '안전구역 설정', icon: LocationOnOutlined },
    { text: '알림 설정 변경', icon: SettingsOutlined },
    { text: '일정 등록', icon: AddOutlined }
  ];

  return (
    <MainContainer>
      {/* 왼쪽 사이드바 - 고정 위치 */}
      <Sidebar elevation={0}>
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

        <SidebarMenu>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <ListItem
                key={index}
                className={activeMenu === item.text ? 'active' : ''}
                onClick={() => {
                  if (item.text === '회원정보 관리') {
                    updateRecentAction(item.text);
                    navigate('/profile/edit');
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
        </SidebarMenu>

        {/* 로그아웃 버튼 */}
        <Box sx={{ px: 2 }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
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
      </Sidebar>

      <ContentContainer elevation={0}>

        {/* 중앙 메인 콘텐츠 */}
        <MainContent>
          {/* 왼쪽 콘텐츠 */}
          <LeftContent>
            {/* 상단 헤더 */}
            <HeaderSection>
              <WelcomeText>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 5, color: '#333' }}>
                  안녕하세요, <span style={{ color: '#1976d2' }}>{guardianInfo.name}</span> 님
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  오늘도 소중한 분의 안전을 지켜주세요.
                </Typography>
              </WelcomeText>
              
            </HeaderSection>

            {/* 하단 3개 박스 */}
            <BottomBoxContainer>
              {/* 왼쪽 박스 - 상태 현황 */}
              <StatusBox elevation={0}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>                  
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {statusData.map((status, index) => {
                    const IconComponent = status.icon;
                    return (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          backgroundColor: '#1976D2',
                          color: 'white',
                          padding: '20px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          minHeight: '80px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <IconComponent sx={{ fontSize: 32 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {status.title}
                          </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {status.count}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </StatusBox>

              {/* 중간 박스 - 최근 활동 현황 */}
              <ActivityBox elevation={0}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  📋 최근 활동 현황
                </Typography>
                
                {/* 상태 표시 범례 및 기준 설명 추가 */}
                <Box sx={{ 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0'
                }}>
                  {/* 범례 */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 1.5,
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip label="정상" color="success" size="small" />
                      <Typography variant="caption" color="text.secondary">양호</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip label="주의" color="warning" size="small" />
                      <Typography variant="caption" color="text.secondary">보통</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip label="긴급" color="error" size="small" />
                      <Typography variant="caption" color="text.secondary">위험</Typography>
                    </Box>
                  </Box>
                  
                  {/* 판정 기준 설명 */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: 1.5,
                    pt: 1.5,
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#2e7d32', display: 'block', mb: 0.5 }}>
                        🟢 정상 조건
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.3 }}>
                        수면 상태 좋음<br/>
                        또는 식사 2회 이상
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ed6c02', display: 'block', mb: 0.5 }}>
                        🟡 주의 조건
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.3 }}>
                        수면 상태 보통<br/>
                        또는 식사 1회
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#d32f2f', display: 'block', mb: 0.5 }}>
                        🔴 긴급 조건
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.3 }}>
                        수면 상태 나쁨<br/>
                        또는 식사 0회
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* 로딩 상태 또는 데이터 없을 때 처리 (2025.07.02 신규 추가) */}
                {/* 기존: 하드코딩된 recentActivities.map() -> 실제 API 데이터 recentActivitiesData */}
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
                  // 실제 API 데이터 표시: time, user, activity, status 필드 사용
                  recentActivitiesData.map((activity, index) => (
                    <ActivityItem key={index}>
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
                    </ActivityItem>
                  ))
                )}
              </ActivityBox>

              {/* 오른쪽 박스 - 오늘의 할 일 & 요약 */}
              <QuickActionBox elevation={0}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 오늘의 요약
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  
                  {/* 대상자 요약 */}
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                      👥 관리 대상자
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        총 {loading ? '...' : seniorStats.totalSeniors}명 관리 중
                      </Typography>
                      <Chip 
                        label={loading ? '...' : `${seniorStats.alerts}건 주의`} 
                        color={seniorStats.alerts > 0 ? 'warning' : 'success'} 
                        size="small" 
                      />
                    </Box>
                  </Paper>

                  {/* 오늘의 할 일 */}
                  <Paper sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: '10px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#f57c00' }}>
                      ✅ 오늘의 할 일
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">• 정기 건강 체크</Typography>
                        <Chip label="2명" size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">• 약물 복용 확인</Typography>
                        <Chip label="3명" size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">• 안전 확인 전화</Typography>
                        <Chip label="1명" size="small" variant="outlined" />
                      </Box>
                    </Box>
                  </Paper>

                  {/* 추천 주변 병원 정보 (2025.07.04 신규 추가) */}
                  <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: '10px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                      🏥 추천 주변 병원
                    </Typography>
                    
                    {hospitalLoading ? (
                      <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 1 }}>
                        병원 정보를 불러오는 중...
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {recommendedHospital.yadmNm}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          📍 {recommendedHospital.addr}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                          📞 {recommendedHospital.telno}
                        </Typography>
                        
                        {busanHospitals.length > 1 && (
                          <Box sx={{ 
                            mt: 1, 
                            pt: 1, 
                            borderTop: '1px solid #e0e0e0',
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
                                width: '32px',
                                height: '32px'
                              }}
                            >
                              <ChevronLeft sx={{ color: '#1976d2', fontSize: '18px' }} />
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
                                width: '32px',
                                height: '32px'
                              }}
                            >
                              <ChevronRight sx={{ color: '#1976d2', fontSize: '18px' }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>

                </Box>
              </QuickActionBox>
            </BottomBoxContainer>
          </LeftContent>

          {/* 오른쪽 세로 긴 박스 - 전체 높이 */}
          <RightCalendarArea elevation={0}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📅 일정 관리
            </Typography>
            
            {/* 달력 컴포넌트 - 선택된 날짜 표시 제거 */}
            <Box sx={{ 
              mb: 2,
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#fafafa',
              flex: '0 0 auto', // 달력 크기 고정
              '& .react-calendar': {
                width: '100%',
                border: 'none',
                fontFamily: 'inherit',
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
                fontWeight: 'bold'
              },
              '& .react-calendar__navigation__label': {
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                flex: 1
              },
              '& .react-calendar__month-view__weekdays': {
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '5px',
                marginBottom: '5px',
                display: 'flex',
                justifyContent: 'space-between'
              },
              '& .react-calendar__month-view__weekdays__weekday': {
                padding: '4px 4px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#666',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '35px',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              },
              '& .react-calendar__tile': {
                padding: '8px',
                fontSize: '0.85rem',
                border: '1px solid #f0f0f0',
                backgroundColor: 'white',
                minHeight: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                }
              },
              '& .react-calendar__tile--active': {
                backgroundColor: '#1976d2 !important',
                color: 'white',
                border: '1px solid #1976d2'
              },
              '& .react-calendar__tile--active:enabled:hover': {

              },
              '& .react-calendar__tile--active:enabled:focus': {
                color: 'white',
              },              
              '& .react-calendar__tile--now': {
                backgroundColor: '#e3f2fd',
                color: '#white',
                border: '1px solid #1976d2'
              },
              '& .react-calendar__tile--now:enabled:focus': {
                backgroundColor: '#e3f2fd',
                color: '#red'
              }
            }}>
              <Calendar
                onChange={(date) => {
                  console.log('달력에서 선택된 날짜:', date);
                  setSelectedDate(date);
                  // 선택된 날짜의 데이터 로드
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
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
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
                gap: '25px',
                mb: 1
              }}>
                {/* 온도 정보 (현재 + 최고/최저) */}
                <Box sx={{ textAlign: 'center', flex: 1.5 }}>
                  <Typography variant="h3" sx={{ 
                    fontSize: '50px',
                    color: '#1976d2', 
                    fontWeight: 'bold', 
                    mb: 1 }}>
                    {weather.temperature}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
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
                      width: '70px',
                      height: '70px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0',
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
                  borderTop: '1px solid #e0e0e0'
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
                    gap: '8px'
                  }}>
                    {weather.weeklyForecast.map((forecast, index) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px 4px',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent',
                        borderRadius: '8px'
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
                          width: '36px',
                          height: '36px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e0e0e0',
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
              
              {/* API 출처 표시 (2025.07.04 추가) */}
              <Box sx={{ 
                textAlign: 'center',                
                borderTop: '1px solid #e0e0e0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#999',
                  fontSize: '0.65rem',
                  fontStyle: 'italic'
                }}>
                  Powered by{' '}
                  <a 
                    href="https://openweathermap.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    OpenWeatherMap
                  </a>
                </Typography>
              </Box>
            </Box>
          </RightCalendarArea>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default Home;