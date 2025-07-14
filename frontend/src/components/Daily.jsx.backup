import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  EditOutlined
} from '@mui/icons-material';
import userImage from '../images/user.png';
import PasswordConfirmModal from './PasswordConfirmModal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Home.jsx와 동일한 스타일 구조
const MainContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#CCE5FF',
  display: 'flex',  
  gap: '0px',
  overflow: 'hidden'
});

const ContentContainer = styled(Paper)({
  backgroundColor: '#ffffff',  
  flex: 1,
  display: 'flex',
  overflow: 'hidden',           // auto → hidden으로 되돌림
  margin: '1vw 20px 1vw 240px',  // 오른쪽 여백 증가
  height: 'calc(100vh - 2vw)',
  minHeight: 'calc(100vh - 2vw)'
});

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

// 중앙 메인 영역 - 홈 화면 구조 참조
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  padding: '30px 30px 30px 30px',
  gap: '20px'
});

// 왼쪽 콘텐츠 영역 - 홈 화면과 동일
const LeftContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
});

// 오른쪽 영역 - 높이 축소
const RightContent = styled(Paper)({
  width: '500px',               // 홈 화면보다 약간 더 넓게
  height: '375px',              // 더 작은 고정 높이
  maxHeight: '500px',           // 최대 높이 제한
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px 20px 15px 20px', // 하단 패딩 줄임 (20px → 15px)
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',                  // 요소들 사이 간격 추가
  overflow: 'auto'              // 내용이 넘치면 스크롤
});

// 상단 헤더
const HeaderSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100px',
  marginBottom: '30px',
  paddingTop: '20px'
});

// 페이지 제목
const PageTitle = styled(Typography)({
  position: 'absolute',
  left: '280px',
  top: '40px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '64px',
  color: '#0869CC'
});

// 캘린더 영역
const CalendarArea = styled(Box)({
  position: 'absolute',
  width: '650px',
  height: '380px',
  left: '280px',
  top: '140px',
  background: '#D9D9D9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const CalendarText = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '36px',
  color: '#000000'
});

// 보호 대상자 목록 헤더
const SeniorListHeader = styled(Box)({
  position: 'absolute',
  width: '650px',
  height: '60px',
  left: '280px',
  top: '540px',
  background: '#0869CC',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const SeniorListHeaderText = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '28px',
  letterSpacing: '1.2em',
  color: '#FFFFFF'
});

// 목록 구분선들
const ListLine = styled(Box)({
  position: 'absolute',
  width: '650px',
  height: '1px',
  left: '280px',
  background: '#0869CC'
});

const ThickLine = styled(Box)({
  position: 'absolute',
  width: '650px',
  height: '4px',
  left: '280px',
  top: '780px',
  background: '#0869CC'
});

// 활동 기록 박스 - 반응형으로 변경
const ActivityBox = styled(Paper)({
  width: '100%',
  height: 'auto',               // fit-content → auto로 변경
  maxHeight: '100%',            // 최대 높이 제한
  background: '#FDFDFD',
  border: '1px solid #D9D9D9',
  borderRadius: '15px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',                   // 15px → 8px로 감소
  overflow: 'visible'           // 스크롤 제거
});

// 대상자 이름 영역 - 반응형으로 변경
const SeniorNameArea = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginBottom: '5px'          // 10px → 5px로 감소
});

const SeniorName = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '32px',  // 48px에서 조금 줄임
  color: '#00458B'
});

const SeniorNameSuffix = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '24px',  // 32px에서 조금 줄임
  color: '#000000'
});

const DateText = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 500,
  fontSize: '16px',
  color: '#666',
  marginBottom: '10px'         // 20px → 10px로 감소
});

// 저장 버튼 - 반응형으로 변경
const SaveButton = styled(Button)({
  alignSelf: 'flex-end',        // 오른쪽 정렬
  width: '100px',
  height: '40px',
  background: '#00458B',
  borderRadius: '10px',
  color: '#FFFFFF',
  fontFamily: 'Pretendard',
  fontWeight: 500,
  fontSize: '16px',
  textTransform: 'none',
  marginBottom: '5px',          // 10px → 5px로 감소
  '&:hover': {
    background: '#003366'
  }
});

// 항목 추가 링크 - 반응형으로 변경
const AddItemLink = styled(Typography)({
  alignSelf: 'flex-end',        // 오른쪽 정렬
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '16px',
  color: '#0869CC',
  cursor: 'pointer',
  marginBottom: '10px',         // 15px → 10px로 감소
  '&:hover': {
    textDecoration: 'underline'
  }
});

// 항목 체크란
const ItemCheckArea = styled(Box)({
  position: 'absolute',
  left: '50px',
  top: '150px'
});

const ItemHeader = styled(Box)({
  width: '380px',
  height: '55px',
  background: '#FFFFFF',
  border: '1px solid #989898',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '20px'
});

const ItemHeaderText = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px',
  color: '#000000'
});

const ItemCheckBox = styled(Box)({
  width: '380px',
  height: '110px',
  background: '#FFFFFF',
  border: '1px solid #989898',
  borderTop: 'none',
  padding: '20px'
});

// 구분선들
const DividerLine = styled(Box)({
  position: 'absolute',
  width: '380px',
  height: '1px',
  left: '50px',
  background: '#CDCDCD'
});

// 수면 상태 영역
const SleepStateArea = styled(Box)({
  position: 'absolute',
  left: '50px',
  top: '340px'
});

const SleepStateTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px',
  color: '#000000',
  marginBottom: '15px'
});

// 캘린더 전용 컨테이너 - 원래 높이로 복원
const CalendarContainer = styled(Box)({
  width: '320px',               // 홈 화면과 동일한 고정 너비
  height: '280px',              // 원래 높이로 복원
  marginBottom: '20px',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  padding: '15px',
  backgroundColor: '#fafafa',
  overflow: 'hidden',           // 컴테이너를 벗어나는 내용 숨김
  '& .react-calendar': {
    width: '100%',
    border: 'none',
    fontFamily: 'Pretendard',
    backgroundColor: 'transparent'
  },
  '& .react-calendar__navigation': {
    height: '40px',               // 높이 축소
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'          // 간격 축소
  },
  '& .react-calendar__navigation button': {
    minWidth: '36px',             // 버튼 크기 축소
    height: '36px',
    fontSize: '16px',             // 폰트 크기 축소
    fontWeight: 'bold',
    borderRadius: '6px'
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
  '& .react-calendar__month-view__days': {
    display: 'grid !important',
    gridTemplateColumns: 'repeat(7, 1fr) !important',
    gap: '2px !important'
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
  '& .react-calendar__tile--now': {
    backgroundColor: '#e3f2fd',
    color: '#white',
    border: '1px solid #1976d2'
  }
});
// 테이블 컨테이너 - 파란색 테두리 추가
const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#ffffff',
  borderRadius: '0',
  border: '2px solid #1976d2',
  boxShadow: 'none'
});

// 테이블 헤더 - 높이 줄임
const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-root': {
    backgroundColor: 'rgba(51, 153, 255, 0.3)',
    borderBottom: '2px solid #1976d2',
    fontFamily: 'Pretendard',
    fontWeight: 700,
    fontSize: '14px',
    color: '#000',
    textAlign: 'center',
    padding: '12px 6px',
    height: '45px'
  }
});

// 테이블 바디 - 높이 줄임 + 클릭 가능
const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      backgroundColor: '#f8f9fa'
    },
    '&:hover': {
      backgroundColor: '#e3f2fd',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    '&.selected': {
      backgroundColor: '#bbdefb !important',
      '&:hover': {
        backgroundColor: '#90caf9 !important'
      }
    }
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #1976d2',
    fontFamily: 'Pretendard',
    fontSize: '12px',
    color: '#333',
    textAlign: 'center',
    padding: '8px 6px',
    height: '35px'
  }
});

const SpecialNotesArea = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '10px'             // 20px → 10px로 감소
});

const SpecialNotesTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '18px',
  color: '#000000'
});

const SpecialNotesBox = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    background: '#FFFFFF',
    border: '1px solid #989898',
    borderRadius: '8px',
    '& fieldset': {
      border: 'none'
    },
    '& textarea': {
      resize: 'vertical',
      minHeight: '120px',
      maxHeight: '200px',
      fontFamily: 'Pretendard',
      fontSize: '14px',
      lineHeight: '1.5',
      padding: '12px'
    }
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#999999',
    fontFamily: 'Pretendard'
  }
});

const Daily = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('일정 관리');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  // 상태 관리
  const [seniors, setSeniors] = useState([]);
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // 드롭다운 관련 상태
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  
  // 폼 데이터 (기존 체크박스용)
  const [formData, setFormData] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    sleepQuality: '',
    specialNotes: ''
  });

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
    
    // 보호 대상자 목록 로드
    loadSeniors();
    // 드롭다운 데이터 로드
    fetchDropdownData();
  }, []);

  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      const token = localStorage.getItem('jwt');
      
      if (!token) {
        console.log('JWT 토큰이 없습니다. 더미 데이터를 사용합니다.');
        // 더미 데이터
        const dummySeniors = [
          { id: 1, seniorName: '김할머니', age: 78 },
          { id: 2, seniorName: '이할아버지', age: 82 },
          { id: 3, seniorName: '박할머니', age: 75 },
          { id: 4, seniorName: '최할아버지', age: 80 },
          { id: 5, seniorName: '정할머니', age: 77 }
        ];
        setSeniors(dummySeniors);
        if (dummySeniors.length > 0) {
          setSelectedSenior(dummySeniors[0]); // 첫 번째 Senior를 기본 선택
        }
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/seniors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // API 응답이 {content: []} 형태인 경우 처리
        const seniorsArray = data.content || data || [];
        
        setSeniors(seniorsArray);
        if (seniorsArray.length > 0) {
          setSelectedSenior(seniorsArray[0]); // 첫 번째 Senior를 기본 선택
        }
      } else {
        console.error('Senior 데이터 로드 실패:', response.status);
        // 실패 시 더미 데이터
        const fallbackSeniors = [
          { id: 1, seniorName: '김할머니', age: 78 },
          { id: 2, seniorName: '이할아버지', age: 82 }
        ];
        setSeniors(fallbackSeniors);
        if (fallbackSeniors.length > 0) {
          setSelectedSenior(fallbackSeniors[0]);
        }
      }
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
      // 오류 시 더미 데이터
      const errorFallback = [
        { id: 1, seniorName: '김할머니', age: 78 }
      ];
      setSeniors(errorFallback);
      if (errorFallback.length > 0) {
        setSelectedSenior(errorFallback[0]);
      }
    }
  };

  // 드롭다운 데이터 불러오기
  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.log('JWT 토큰이 없습니다. 더미 데이터를 사용합니다.');
        // 토큰이 없을 때 더미 데이터
        const dummyData = [
          '식사횟수', '운동시간', '복약여부', '건강상태', '활동수준'
        ];
        setDropdownItems(dummyData);
        
        const initialSelected = {};
        dummyData.forEach(itemValue => {
          initialSelected[itemValue] = '';
        });
        setSelectedItems(initialSelected);
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/user-settings/dropdown-items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('드롭다운 데이터 로드 성공:', data);
        
        // 백엔드에서 String 배열로 받아오므로 직접 사용
        // 유효한 문자열만 필터링
        const validItems = data.filter(item => item && typeof item === 'string' && item.trim() !== '');
        setDropdownItems(validItems);
        
        // 초기 선택값 설정
        const initialSelected = {};
        validItems.forEach(itemValue => {
          initialSelected[itemValue] = ''; // 기본값은 비워둔상태
        });
        setSelectedItems(initialSelected);
      } else {
        console.error('API 응답 오류:', response.status, response.statusText);
        throw new Error(`API 오류: ${response.status}`);
      }
      
    } catch (error) {
      console.error('드롭다운 데이터 불러오기 실패:', error);
      setError('드롭다운 데이터를 불러오는데 실패했습니다. 더미 데이터를 사용합니다.');
      
      // 오류 시 더미 데이터로 폴백
      const fallbackData = [
        {
          id: 1,
          subCategory: '식사횟수',
          values: '["1회", "2회", "3회", "4회", "5회"]'
        }
      ];
      setDropdownItems(fallbackData);
      
      const initialSelected = {};
      fallbackData.forEach(item => {
        try {
          const values = JSON.parse(item.values);
          initialSelected[item.subCategory] = values[0];
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
        }
      });
      setSelectedItems(initialSelected);
    } finally {
      setLoading(false);
    }
  };

  // 드롭다운 값 변경 핸들러
  const handleItemChange = (subCategory, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [subCategory]: value
    }));
  };

  // 폼 체크박스 핸들러
  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked
    });
  };

  // 폼 입력 핸들러
  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('jwt');
      
      const saveData = {
        selectedItems,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
        formData
      };
      
      console.log('저장할 데이터:', saveData);
      
      if (!token) {
        console.log('JWT 토큰이 없습니다. 로컬 저장만 수행합니다.');
        setSuccess('활동 기록이 저장되었습니다. (로컬)');
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/daily-activities/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('저장 성공:', result);
        setSuccess('활동 기록이 저장되었습니다.');
      } else {
        console.error('저장 API 오류:', response.status, response.statusText);
        throw new Error(`저장 실패: ${response.status}`);
      }
      
    } catch (error) {
      console.error('저장 오류:', error);
      setError('저장에 실패했습니다.');
    }
  };

  // 비밀번호 확인 모달 열기
  const handleProfileManagementClick = () => {
    setShowPasswordModal(true);
  };

  // 비밀번호 확인 성공 시 회원정보 관리로 이동
  const handlePasswordConfirm = () => {
    navigate('/profile/management');
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

  return (
    <MainContainer>
      {/* 사이드바 */}
      <Sidebar elevation={0}>
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
                  if (item.text === '홈') {
                    navigate('/home');
                  } else if (item.text === '회원정보 관리') {
                    handleProfileManagementClick();
                  } else if (item.text === '보호 대상자') {
                    navigate('/seniors');
                  } else if (item.text === '일정 관리') {
                    setActiveMenu(item.text);
                  } else {
                    setActiveMenu(item.text);
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
        <MainContent>
          <LeftContent>
            {/* 페이지 제목 */}
            <Typography variant="h2" sx={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '32px',
              color: '#0869CC',
              marginBottom: '30px'
            }}>
              일정 관리
            </Typography>

            {/* 캘린더 영역 */}
            <CalendarContainer>
              <Calendar
                onChange={(date) => {
                  console.log('달력에서 선택된 날짜:', date);
                  setSelectedDate(date);
                }}
                value={selectedDate}
                locale="ko-KR"
                formatShortWeekday={(locale, date) => {
                  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                  return weekdays[date.getDay()];
                }}
                formatDay={(locale, date) => date.getDate().toString()}
              />
            </CalendarContainer>

            {/* 보호 대상자 목록 */}
            <Box sx={{ marginTop: '30px' }}>
              <Typography variant="h6" sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '20px',
                color: '#0869CC',
                marginBottom: '15px'
              }}>
                보호 대상자 목록
              </Typography>
              
              {loading ? (
                <Typography sx={{ p: 2, textAlign: 'center' }}>로딩 중...</Typography>
              ) : seniors.length > 0 ? (
                <StyledTableContainer component={Paper}>
                  <Table>
                    <StyledTableHead>
                      <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>나이</TableCell>
                        <TableCell>상태</TableCell>
                      </TableRow>
                    </StyledTableHead>
                    <StyledTableBody>
                      {seniors.map((senior, index) => (
                        <TableRow 
                          key={senior.id}
                          onClick={() => {
                            console.log('선택된 Senior:', senior);
                            setSelectedSenior(senior);
                          }}
                          className={selectedSenior && selectedSenior.id === senior.id ? 'selected' : ''}
                        >
                          <TableCell>{senior.seniorName}</TableCell>
                          <TableCell>{senior.age ? `${senior.age}세` : '-'}</TableCell>
                          <TableCell 
                            sx={{
                              color: selectedSenior && selectedSenior.id === senior.id ? '#1976d2' : '#666',
                              fontWeight: selectedSenior && selectedSenior.id === senior.id ? 'bold' : 'normal'
                            }}
                          >
                            {selectedSenior && selectedSenior.id === senior.id ? '선택됨' : '대기'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* 빈 행들 (디자인을 위해) */}
                      {Array.from({ length: Math.max(0, 5 - seniors.length) }).map((_, index) => (
                        <TableRow key={`empty-${index}`}>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                        </TableRow>
                      ))}
                    </StyledTableBody>
                  </Table>
                </StyledTableContainer>
              ) : (
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  color: '#666666',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  등록된 보호 대상자가 없습니다.
                </Typography>
              )}
            </Box>
          </LeftContent>

          <RightContent>
            {/* 활동 기록 헤더 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: '8px', sm: '0' }
            }}>
              <Typography variant="h6" sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: { xs: '20px', md: '24px' },
                color: '#0869CC',
                lineHeight: 1.2
              }}>
                {selectedSenior ? selectedSenior.seniorName : '대상자 선택'}님 활동 기록
              </Typography>

              {/* 날짜 */}
              <Typography sx={{
                fontFamily: 'Pretendard',
                fontSize: { xs: '14px', md: '16px' },
                color: '#666',
                whiteSpace: 'nowrap'
              }}>
                {new Date().toLocaleDateString('ko-KR')}
              </Typography>
            </Box>

            {/* 상단 액션 영역 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: '12px', sm: '16px' }
            }}>
              {/* 항목 추가 링크 */}
              <Typography sx={{
                fontFamily: 'Pretendard',
                fontSize: { xs: '14px', md: '16px' },
                color: '#0869CC',
                cursor: 'pointer',
                order: { xs: 2, sm: 1 },
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}>
                + 항목 추가
              </Typography>

              {/* 저장 버튼 */}
              <Button
                onClick={handleSave}
                size="small"
                sx={{
                  backgroundColor: '#00458B',
                  color: 'white',
                  fontFamily: 'Pretendard',
                  fontSize: { xs: '14px', md: '16px' },
                  padding: { xs: '8px 16px', md: '10px 20px' },
                  borderRadius: '8px',
                  order: { xs: 1, sm: 2 },
                  minHeight: '40px',
                  '&:hover': {
                    backgroundColor: '#003366'
                  }
                }}
              >
                저장
              </Button>
            </Box>

            {/* 드롭다운 */}
            <Box>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedItems[dropdownItems[0]] || ''}
                  onChange={(e) => handleItemChange(dropdownItems[0], e.target.value)}
                  displayEmpty
                  sx={{
                    fontFamily: 'Pretendard',
                    fontSize: { xs: '14px', md: '16px' },
                    minHeight: '40px'
                  }}
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  {dropdownItems.map((itemValue, index) => (
                    <MenuItem key={index} value={itemValue}>
                      {itemValue}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 일일 특이사항 */}
            <Box sx={{ marginBottom: '0px' }}> {/* 하단 여백 제거 */}
              <Typography sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '10px'
              }}>
                일일 특이사항
              </Typography>
              <TextField
                multiline
                rows={6}
                value={formData.specialNotes}
                onChange={handleInputChange}
                name="specialNotes"
                placeholder="특이사항을 입력하세요..."
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Pretendard',
                    fontSize: '14px'
                  },
                  marginBottom: '0px' // TextField 하단 여백 제거
                }}
              />
            </Box>
          </RightContent>
        </MainContent>
      </ContentContainer>

      {/* 비밀번호 확인 모달 */}
      <PasswordConfirmModal 
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
      />

      {/* 메시지 표시 */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500
          }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
    </MainContainer>
  );
};

export default Daily;