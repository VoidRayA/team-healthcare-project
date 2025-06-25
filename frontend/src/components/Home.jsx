import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';

// 스타일드 컴포넌트들
const HomeContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5'
});

const Sidebar = styled(Paper)({
  width: '280px',
  backgroundColor: '#6a5acd',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
  borderRadius: '0'
});

const SidebarHeader = styled(Box)({
  padding: '0 20px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  marginBottom: '20px'
});

const SidebarTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
});

const SidebarMenu = styled(List)({
  padding: '0',
  '& .MuiListItem-root': {
    color: 'white',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    },
    '&.active': {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRight: '4px solid white'
    }
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '40px'
  }
});

const MainContent = styled(Box)({
  flex: 1,
  padding: '30px',
  overflow: 'auto'
});

const HeaderSection = styled(Box)({
  marginBottom: '30px'
});

const WelcomeCard = styled(Card)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: '20px'
});

const StatusCard = styled(Card)({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  }
});

const StatusIcon = styled(Box)({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '15px'
});

const ActivityCard = styled(Paper)({
  padding: '20px',
  marginBottom: '20px'
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
    name: '김보호',
    loginId: 'test001',
    role: 'GUARDIAN'
  });

  // 예시 데이터들 (아이콘을 이모지로 변경)
  const statusData = [
    {
      title: '긴급 알림',
      count: 2,
      icon: '⚠️',
      color: '#ff4444',
      bgColor: '#ffebee',
      description: '즉시 확인이 필요한 알림'
    },
    {
      title: '금일 대상자',
      count: 5,
      icon: '👤',
      color: '#2196f3',
      bgColor: '#e3f2fd',
      description: '오늘 모니터링 대상자'
    },
    {
      title: '건강 상태',
      count: 3,
      icon: '✅',
      color: '#4caf50',
      bgColor: '#e8f5e8',
      description: '정상 상태 유지 중'
    },
    {
      title: '연결 장치',
      count: 8,
      icon: '🔒',
      color: '#9c27b0',
      bgColor: '#f3e5f5',
      description: '연결된 IoT 장치'
    }
  ];

  const recentActivities = [
    {
      time: '10:30',
      user: '김영수',
      activity: '안전지대 이탈 감지',
      status: 'warning',
      icon: '📍'
    },
    {
      time: '09:15',
      user: '박미영',
      activity: '정상 귀가 확인',
      status: 'success',
      icon: '✅'
    },
    {
      time: '08:45',
      user: '이철수',
      activity: '응급호출 버튼 작동',
      status: 'error',
      icon: '📞'
    },
    {
      time: '08:20',
      user: '최순자',
      activity: '일일 건강체크 완료',
      status: 'success',
      icon: '✅'
    }
  ];

  const menuItems = [
    { icon: '📊', text: '대시보드', badge: null },
    { icon: '👤', text: '보호 대상자', badge: null },
    { icon: '🔒', text: '안전 모니터링', badge: 2 },
    { icon: '🔔', text: '알림 센터', badge: 5 },
    { icon: '📅', text: '일정 관리', badge: null },
    { icon: '💬', text: '메시지', badge: 3 },
    { icon: '⚙️', text: '설정', badge: null }
  ];

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
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
    // App.jsx에서 자동으로 로그인 페이지로 리다이렉트
    window.location.reload();
  };

  return (
    <HomeContainer>
      {/* 사이드바 */}
      <Sidebar elevation={0}>
        <SidebarHeader>
          <SidebarTitle>
            🔒 건강지킴이
          </SidebarTitle>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            보호자 대시보드 📱
          </Typography>
        </SidebarHeader>

        <SidebarMenu>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              className={activeMenu === item.text ? 'active' : ''}
              onClick={() => setActiveMenu(item.text)}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <Typography sx={{fontSize: '20px'}} gutterBottom>{item.icon}</Typography>
                  </Badge>
                ) : (
                  <Typography sx={{fontSize: '20px'}} gutterBottom>{item.icon}</Typography>
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </SidebarMenu>

        {/* 로그아웃 버튼 */}
        <Box sx={{ mt: 'auto', p: '0 20px' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<span>🔌</span>}
            onClick={handleLogout}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            로그아웃
          </Button>
        </Box>
      </Sidebar>

      {/* 메인 콘텐츠 */}
      <MainContent>
        {/* 헤더 섹션 */}
        <HeaderSection>
          <WelcomeCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" gutterBottom>
                    안녕하세요, {guardianInfo.name}님! 👋
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    오늘도 소중한 분들의 안전을 지켜주세요.
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '32px'
                  }}
                >
                  {guardianInfo.name.charAt(0)}
                </Avatar>
              </Box>
            </CardContent>
          </WelcomeCard>
        </HeaderSection>

        {/* 상태 카드들 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statusData.map((status, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatusCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StatusIcon sx={{ bgcolor: status.bgColor, color: status.color, mx: 'auto' }}>
                    <span style={{ fontSize: '24px' }}>{status.icon}</span>
                  </StatusIcon>
                  <Typography variant="h4" color={status.color} fontWeight="bold">
                    {status.count}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {status.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {status.description}
                  </Typography>
                </CardContent>
              </StatusCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* 최근 활동 */}
          <Grid item xs={12} md={8}>
            <ActivityCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  📋 최근 활동 현황
                </Typography>
                <Chip label="실시간" color="primary" size="small" />
              </Box>
              
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index}>
                  <Box sx={{ mr: 2 }}>
                    <span style={{ fontSize: '20px' }}>{activity.icon}</span>
                  </Box>
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
            </ActivityCard>
          </Grid>

          {/* 빠른 작업 */}
          <Grid item xs={12} md={4}>
            <ActivityCard>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⚡ 빠른 작업
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<span>👤</span>}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  새 보호대상자 추가
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<span>🔒</span>}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  안전구역 설정
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<span>🔔</span>}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  알림 설정 변경
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<span>📅</span>}
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  일정 등록
                </Button>
              </Box>
            </ActivityCard>

            {/* 현재 날씨/시간 정보 */}
            <ActivityCard sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🌤️ 오늘의 정보
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  23°C
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  맑음, 부산
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Typography>
              </Box>
            </ActivityCard>
          </Grid>
        </Grid>
      </MainContent>
    </HomeContainer>
  );
};

export default Home;