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
  InputLabel
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
  overflow: 'auto',
  margin: '1vw 1vw 1vw 240px',
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

// 중앙 메인 영역
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  padding: '30px 30px 30px 30px',
  gap: '20px'
});

// 왼쪽 콘텐츠 영역
const LeftContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
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
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '36px',
  color: '#1976d2',
  marginBottom: '10px'
});

// 하단 박스 컨테이너
const BottomBoxContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  flex: 1
});

// 오른쪽 세로 긴 박스 (활동 기록)
const RightActivityArea = styled(Paper)({
  width: '400px',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  height: '700px',
  overflow: 'hidden'
});

// 캘린더 박스
const CalendarBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
});

// 보호 대상자 목록 박스
const SeniorListBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  minHeight: '400px',
  overflow: 'auto'
});

// 박스 제목
const BoxTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px',
  color: '#1976d2',
  marginBottom: '20px'
});

// 대상자 이름 영역
const SeniorNameArea = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '15px'
});

const SeniorName = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '28px',
  color: '#00458B'
});

const SeniorNameSuffix = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px',
  color: '#000000'
});

const DateText = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 500,
  fontSize: '16px',
  color: '#666',
  marginBottom: '20px'
});

// 저장 버튼
const SaveButton = styled(Button)({
  alignSelf: 'flex-end',
  width: '100px',
  height: '40px',
  background: '#1976d2',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontFamily: 'Pretendard',
  fontWeight: 600,
  fontSize: '14px',
  textTransform: 'none',
  marginBottom: '20px',
  '&:hover': {
    background: '#1565c0'
  }
});

// 활동 항목 컨테이너
const ActivitySection = styled(Box)({
  marginBottom: '25px'
});

const ActivitySectionTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 600,
  fontSize: '16px',
  color: '#333',
  marginBottom: '12px'
});

// 체크박스 그룹
const CheckboxGroup = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef'
});

// 수면 상태 그룹
const SleepStateGroup = styled(Box)({
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef'
});

// 특이사항 입력
const SpecialNotesBox = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // 폼 데이터
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
  }, []);

  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;

      // TODO: 실제 API 호출
      setSeniors([
        { id: 1, seniorName: '김할머니' },
        { id: 2, seniorName: '이할아버지' }
      ]);
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    }
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
      if (!token) return;

      // TODO: 실제 API 호출
      console.log('저장할 데이터:', formData);
      
      setSuccess('활동 기록이 저장되었습니다.');
      
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
          {/* 왼쪽 콘텐츠 영역 */}
          <LeftContent>
            {/* 상단 헤더 */}
            <HeaderSection>
              <Box>
                <PageTitle>일정 관리</PageTitle>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#666', 
                    fontFamily: 'Pretendard',
                    fontWeight: 400 
                  }}
                >
                  보호 대상자의 일상 활동을 기록하고 관리하세요
                </Typography>
              </Box>
            </HeaderSection>

            {/* 하단 박스 컨테이너 */}
            <BottomBoxContainer>
              {/* 캘린더 박스 */}
              <CalendarBox>
                <BoxTitle>달력</BoxTitle>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="ko-KR"
                  formatDay={(locale, date) => date.getDate().toString()}
                  showNeighboringMonth={false}
                  next2Label={null}
                  prev2Label={null}
                  style={{
                    width: '100%',
                    border: 'none',
                    fontFamily: 'Pretendard'
                  }}
                />
              </CalendarBox>

              {/* 보호 대상자 목록 박스 */}
              <SeniorListBox>
                <BoxTitle>보호 대상자 목록</BoxTitle>
                {seniors.map((senior) => (
                  <Box key={senior.id} sx={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e9ecef'
                    }
                  }}>
                    <Typography sx={{
                      fontFamily: 'Pretendard',
                      fontWeight: 600,
                      fontSize: '16px'
                    }}>
                      {senior.seniorName}
                    </Typography>
                  </Box>
                ))}
              </SeniorListBox>
            </BottomBoxContainer>
          </LeftContent>

          {/* 오른쪽 활동 기록 영역 */}
          <RightActivityArea>
            <BoxTitle>일일 활동 기록</BoxTitle>
            
            {/* 대상자 이름 */}
            <SeniorNameArea>
              <SeniorName>김할머니</SeniorName>
              <SeniorNameSuffix>님</SeniorNameSuffix>
            </SeniorNameArea>
            
            <DateText>
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DateText>

            {/* 저장 버튼 */}
            <SaveButton onClick={handleSave}>
              저장하기
            </SaveButton>                        

            {/* 특이사항 */}
            <ActivitySection>
              <ActivitySectionTitle>특이사항</ActivitySectionTitle>
              <SpecialNotesBox
                multiline
                rows={4}
                value={formData.specialNotes}
                onChange={handleInputChange}
                name="specialNotes"
                placeholder="오늘의 특이사항이나 메모를 입력하세요..."
                variant="outlined"
              />
            </ActivitySection>
          </RightActivityArea>
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