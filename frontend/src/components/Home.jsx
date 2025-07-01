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
import user from '../images/user.png';
import logout from '../images/logout.png';
import IconImage from '../images/기록_아이콘2.png';
import SpeedBox from '../images/빠른.png';
import 대상자이미지 from '../images/대상자2.png';
import 위치이미지 from '../images/location.png';
import 알림이미지 from '../images/alert.png';
import 일정이미지 from '../images/일정.png';




// 스타일드 컴포넌트들
const HomeContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#ffffff'
});

// 뒷 배경에 깔려있는 하늘색 창
const Background = styled(Box)({
  position: 'absolute',
  display: 'flex',
  width: '100vw',
  height: '100vh',
  left: '0px',
  top: '0px',
  background: 'linear-gradient(180deg, rgba(0, 124, 255, 0.2) 0%, rgba(0, 188, 255, 0.2) 100%)'
});

// 하얀색 보드판
const MainBoard = styled(Box)({
  position: 'absolute',
  width: '95vw',
  height: '95vh',
  left: 'calc(80% - 1800px/2)',
  top: 'calc(80% - 1000px/2)',
  background: '#FFFFFF',
  borderRadius: '10px',
  });
  



const Sidebar = styled(Paper)({
  position: 'absolute',
  width: '237px', 
  height: '100vh',
  left: '0px',
  top: '40px',
  background: '#007CFF',
  borderRadius: '0px 40px 40px 0px',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
});

// Sidebar에 있는 사용자 아이콘
const UserIconBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '50.27px',
  height: '50.27px',
  left: '34.36px',
  top: '30px',
  '& img': {
    width: '30px',
    height: '30px',
    filter: 'brightness(0) invert(1)'
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    '& img': {
      width: '24px',
      height: '24px'
    }
  }
}));

const SidebarMenu = styled(List)({
  padding: '0',
  '& .MuiListItem-root': {
    color: 'white',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    '&.active': {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRight: '4px solid white',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '40px',
  },
  // Typography 스타일 추가 부분
  '& .sidebar-title': {
    position: 'absolute',
    width: '50.27px',
    height: '50.27px',
    left: '38px',
    top: '222.05px',
    fontFamily: 'GyeonggiTitle',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '25px',
    lineHeight: '25px',
    color: '#FFFFFF',
  },
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
  background: '#ffffff',
  color: 'white',
  marginBottom: '20px'
});

const MainContentHello = styled(Typography)({
  position: 'absolute',
  width: '268px',
  height: '53px',
  left: '299px',
  top: '191px',
  fontFamily: 'SUITE',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '35px',
  lineHeight: '44px',
  color: '#000000',
});

// "000" 스타일
const MainContentNumber = styled(Typography)({
  position: 'absolute',
  width: '146px',
  height: '71px',
  left: '483px',
  top: '173px',
  fontFamily: 'SUITE',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '55px',
  lineHeight: '69px',
  color: '#00458B',
});

// "님" 스타일
const MainContentSuffix = styled(Typography)({
  position: 'absolute',
  width: '42px',
  height: '68px',
  left: '620px',
  top: '174px',
  fontFamily: 'SUITE',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '55px',
  lineHeight: '69px',
  color: '#000000',
});

// "오늘도 소중한 분의 안전을 지키는 멋진 하루 되세요." 스타일
const MainContentMessage = styled(Typography)({
  position: 'absolute',
  width: '597px',
  height: '49px',
  left: '299px',
  top: '272px',
  fontFamily: 'SUITE',
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: '30px',
  lineHeight: '37px',
  color: '#000000',
});










const StateBox = styled(Box)({
  boxSizing: 'border-box',
  position: 'absolute',
  width: '330px',
  height: '533px',
  left: '299px',
  top: '436px',
  background: '#00458B',
  border: '0.5px solid #CCE5FF',
  boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.25)',
  borderRadius: '13px',
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

const ActivityBoxIconBg = styled('div')({
  position: 'absolute',
  width: '28.8px',
  height: '39.17px',
  left: '730px',
  top: '473px',
  backgroundImage: `url(${IconImage})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
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
      // icon: <EmergencyBox src="긴급.png" alt=" " />,
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

  const ActivityBox = styled(Box)({
    boxSizing: 'border-box',
    position: 'absolute',
    width: '330px',
    height: '533px',
    left: '644px',
    top: '436px',
    background: '#FFFFFF',
    border: '0.5px solid #00458B',
    boxShadow: '0px 0px 0px rgba(0, 0, 0, 0.25)',
    borderRadius: '13px', 
    });

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
    { text: '대시보드', badge: null },
    { text: '보호 대상자', badge: null },
    { text: '안전 모니터링', badge: null },
    { text: '알림 센터', badge: null },
    { text: '일정 관리', badge: null },
    { text: '메시지', badge: null },
    { text: '설정', badge: null }
  ];

  const SpeedImage = styled('img')({
    position: 'absolute',
    width: '24px',
    height: '44px',
    left: '1098px',
    top: '477px',
    background: 'url(빠른.png)'
    });
    

    const New = styled('img')({
      width: '31px',
      height: '35px',
    });


  

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
      <Background>
        <MainBoard>
        {/* 사이드바 */}
        <Sidebar elevation={0}>
            <UserIconBox>
            <img src={user} alt="user" />
            </UserIconBox>
            {/* <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              보호자 대시보드 📱
            </Typography> */}
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
              startIcon={<img src={logout} alt="logout"style={{ width: '25px', height: '25px' }} />}
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
                    <div>
                      <MainContentHello>안녕하세요,</MainContentHello>
                      <MainContentNumber>관리자</MainContentNumber>
                      <MainContentSuffix>님</MainContentSuffix>
                      <MainContentMessage>오늘도 소중한 분의 안전을 지켜주세요.</MainContentMessage>
                    </div>
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
          <StateBox>
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
          </StateBox>

          <Grid container spacing={3}>
            {/* 최근 활동 */}
            <ActivityBox>
            <Grid item xs={12} md={8}>
              <ActivityCard>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <ActivityBoxIconBg />
                  <Typography variant="h6" fontWeight="bold">
                    최근 활동 현황
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
            </ActivityBox>

            {/* 빠른 작업 */}
            <Grid item xs={12} md={4}>
              <ActivityCard>
                <SpeedImage src={SpeedBox} alt="빠른 응답" />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚡ 빠른 작업
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<New src={대상자이미지} alt=" " />}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    새 보호대상자 추가
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<New src={위치이미지} alt=" " />}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    안전구역 설정
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<New src={알림이미지} alt=" " />}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  >
                    알림 설정 변경
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<New src={일정이미지} alt=" " />}
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
        </MainBoard>
      </Background>
    </HomeContainer>
  );
};

export default Home;