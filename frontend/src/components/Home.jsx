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
  AccountCircleOutlined,  
  LocationOnOutlined,
  SettingsOutlined,
  AddOutlined
} from '@mui/icons-material';

// 전체 컨테이너 - 연한 파란 배경
const MainContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#CCE5FF',
  display: 'flex',
  padding: '20px 20px 20px 0',
  gap: '20px'
});

// 메인 컨테이너 - 하얀색
const ContentContainer = styled(Paper)({
  backgroundColor: '#ffffff',  
  flex: 1,
  display: 'flex',
  overflow: 'hidden'
});

// 왼쪽 사이드바
const Sidebar = styled(Paper)({
  width: '240px',
  backgroundColor: '#1976d2',
  borderRadius: '0 20px 20px 0',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
  color: 'white'
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
  padding: '30px',
  gap: '20px'
});

// 왼쪽 콘텐츠 영역
const LeftContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  // justifyContent: 'space-between' // 상단과 하단을 양쪽 끝으로 분리
});

// 상단 헤더
const HeaderSection = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '40px', // 하단 여백 증가
  paddingTop: '20px'    // 상단 여백 추가
});

const WelcomeText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1
});

const ProfileSection = styled(Box)({
  position: 'relative'
});

// 하단 3개 박스 컨테이너
const BottomBoxContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '15px',
  height: '400px' // 박스 높이 제한
});

// 오른쪽 세로 긴 박스 - 전체 높이
const RightCalendarArea = styled(Paper)({
  width: '280px',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column'
});

// 왼쪽 박스 (상태 박스)
const StatusBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  overflow: 'auto'
});

// 중간 박스 (최근 활동)
const ActivityBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
  overflow: 'auto'
});

// 오른쪽 박스 (빠른 작업)
const QuickActionBox = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '20px',
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
      <ContentContainer elevation={0}>
        {/* 왼쪽 사이드바 */}
        <Sidebar elevation={0}>
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

        {/* 중앙 메인 콘텐츠 */}
        <MainContent>
          {/* 왼쪽 콘텐츠 */}
          <LeftContent>
            {/* 상단 헤더 */}
            <HeaderSection>
              <WelcomeText>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                  안녕하세요, <span style={{ color: '#1976d2' }}>{guardianInfo.name}</span> 님
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  오늘도 소중한 분의 안전을 지켜주세요.
                </Typography>
              </WelcomeText>
              
              <ProfileSection>
                <Box
                  sx={{ 
                    width: '200px',
                    height: '120px',
                    border: '3px solid #bdbdbd',
                    borderRadius: '15px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountCircleOutlined sx={{ fontSize: 50, color: '#bdbdbd' }} />
                </Box>
              </ProfileSection>
            </HeaderSection>

            {/* 하단 3개 박스 */}
            <BottomBoxContainer>
              {/* 왼쪽 박스 - 상태 현황 */}
              <StatusBox elevation={0}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 상태 현황
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                  {statusData.map((status, index) => {
                    const IconComponent = status.icon;
                    return (
                      <Button
                        key={index}
                        fullWidth
                        variant="outlined"
                        startIcon={<IconComponent sx={{ color: status.color }} />}
                        endIcon={
                          <Typography variant="h6" fontWeight="bold" sx={{ color: status.color }}>
                            {status.count}
                          </Typography>
                        }
                        sx={{ 
                          justifyContent: 'space-between', 
                          py: 1.5,
                          textTransform: 'none'
                        }}
                      >
                        {status.title}
                      </Button>
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
            <Box sx={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: '10px',
              color: '#999',
              mb: 3
            }}>
              달력 컴포넌트 영역
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📋 추가 컴포넌트
            </Typography>
            <Box sx={{ 
              flex: 1,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: '10px',
              color: '#999'
            }}>
              추후 추가될 컴포넌트 영역
            </Box>
          </RightCalendarArea>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default Home;