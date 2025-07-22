import { useState, useEffect } from 'react';
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
  ChevronRight,
  ClearOutlined
} from '@mui/icons-material';
import userImage from '../../images/user.png';
import { getUserInfo, clearAuthData } from '../../utils/auth';

const Setting = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('설정');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });

  useEffect(() => {
    const userInfo = getUserInfo();
    
    if (userInfo) {
      setGuardianInfo({
        name: userInfo.name,
        loginId: userInfo.loginId,
        role: userInfo.role || 'GUARDIAN'
      });
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    alert('로그아웃 되었습니다.');
    window.dispatchEvent(new Event('authStateChange'));
    window.location.reload();
  };

  const menuItems = [
    { text: '홈', icon: DashboardOutlined },
    { text: '회원정보 관리', icon: EditOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '설정', icon: SettingsOutlined }
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
        {/* 사이드바 */}
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
  
          <List sx={{
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
          }}>
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
                      navigate('/profile/management');
                    } else if (item.text === '보호 대상자') {
                      navigate('/seniors');
                    } else if (item.text === '일정 관리') {
                      navigate('/daily');
                    } else if (item.text === '설정') {
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
          </List>
  
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
        </Paper>
      </Box>
  )
}

export default Setting;