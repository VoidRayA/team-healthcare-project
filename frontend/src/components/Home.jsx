import React, { useState, useEffect } from 'react';
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
  AddOutlined
} from '@mui/icons-material';
import userImage from '../images/user.png';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
  width: '280px',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  height: '803px', // 고정 높이로 왼쪽과 정확히 맞춤
  overflow: 'auto' // 내용이 넘치면 스크롤
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
  const [activeMenu, setActiveMenu] = useState('대시보드');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  const [selectedDate, setSelectedDate] = useState(new Date()); // 달력 날짜 상태
  const [weather, setWeather] = useState({
    temperature: '22°C',
    condition: '맑음',
    humidity: '65%',
    location: '부산'
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('loginId');
    localStorage.removeItem('guardianName');
    localStorage.removeItem('role');
    
    alert('로그아웃 되었습니다.');
    window.location.reload();
  };

  const menuItems = [
    { text: '대시보드', icon: DashboardOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '안전 모니터링', icon: SecurityOutlined },
    { text: '알림 센터', icon: NotificationsOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '메시지', icon: MessageOutlined }
  ];

  const statusData = [
    {
      title: '긴급 알림',
      count: 2,
      icon: WarningAmberOutlined,
      color: '#ff4444'
    },
    {
      title: '금일 대상자',
      count: 5,
      icon: PeopleOutlined,
      color: '#2196f3'
    },
    {
      title: '건강 상태',
      count: 3,
      icon: FavoriteOutlined,
      color: '#4caf50'
    },
    {
      title: '연결 장치',
      count: 8,
      icon: DevicesOutlined,
      color: '#9c27b0'
    }
  ];

  const recentActivities = [
    {
      time: '10:30',
      user: '김영수',
      activity: '안전지대 이탈 감지',
      status: 'warning'
    },
    {
      time: '09:15',
      user: '박미영',
      activity: '정상 귀가 확인',
      status: 'success'
    },
    {
      time: '08:45',
      user: '이철수',
      activity: '응급호출 버튼 작동',
      status: 'error'
    },
    {
      time: '08:20',
      user: '최순자',
      activity: '일일 건강체크 완료',
      status: 'success'
    }
  ];

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
                onClick={() => setActiveMenu(item.text)}
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
                
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="500">
                        {activity.user}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.activity}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
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
                  </ActivityItem>
                ))}
              </ActivityBox>

              {/* 오른쪽 박스 - 빠른 작업 */}
              <QuickActionBox elevation={0}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚡ 빠른 작업
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={index}
                        fullWidth
                        variant="outlined"
                        startIcon={<IconComponent />}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          py: 1.5,
                          textTransform: 'none'
                        }}
                      >
                        {action.text}
                      </Button>
                    );
                  })}
                </Box>
              </QuickActionBox>
            </BottomBoxContainer>
          </LeftContent>

          {/* 오른쪽 세로 긴 박스 - 전체 높이 */}
          <RightCalendarArea elevation={0}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📅 일정 관리
            </Typography>
            
            {/* 달력 컴포넌트 */}
            <Box sx={{ 
              mb: 3,
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '15px',
              backgroundColor: '#fafafa',
              '& .react-calendar': {
                width: '100%',
                border: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'transparent'
              },
              '& .react-calendar__navigation': {
                marginBottom: '10px',
                height: '44px',
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
                padding: '8px 4px',
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
              '& .react-calendar__tile--now': {
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                border: '1px solid #1976d2'
              }
            }}>
              <Calendar
                onChange={setSelectedDate}
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
              🌦️ 날씨 정보
            </Typography>
            <Box sx={{ 
              flex: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* 위치 정보 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 'bold' }}>
                  {weather.location}
                </Typography>
              </Box>
              
              {/* 메인 날씨 정보 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                mb: 2
              }}>
                <Typography variant="h3" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {weather.temperature}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#333' }}>
                    {weather.condition}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    습도: {weather.humidity}
                  </Typography>
                </Box>
              </Box>
              
              {/* 추가 정보 */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                pt: 2,
                borderTop: '1px solid #e0e0e0'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    최고기온
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    25°C
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    최저기온
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    18°C
                  </Typography>
                </Box>
              </Box>
            </Box>
          </RightCalendarArea>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default Home;