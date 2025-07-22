import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,  
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,  
  EventOutlined,  
  LogoutOutlined,
  SettingsOutlined,  
  EditOutlined
} from '@mui/icons-material';
import userImage from '../../images/user.png';
import { clearAuthData, getAuthToken, parseJwt } from '../../utils/auth';

const Sidebar = ({ 
  guardianInfo, 
  activeMenu, 
  setActiveMenu, 
  updateRecentAction 
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const accessToken = getAuthToken();
    const tokenId = accessToken ? parseJwt(accessToken)?.jti : null;
  
    try {
      if (tokenId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId }),
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

  const handleMenuClick = (item) => {
    if (item.text === '회원정보 관리') {
      updateRecentAction(item.text);
      navigate('/profile/management');
    } else if (item.text === '보호 대상자') {
      updateRecentAction(item.text);
      navigate('/seniors');
    } else if (item.text === '일정 관리') {
      updateRecentAction(item.text);
      navigate('/daily');
    } else if (item.text === '설정') {
      updateRecentAction(item.text);
      navigate('/settings');
    } else {
      setActiveMenu(item.text);
      updateRecentAction(item.text);
    }
  };

  return (
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
              onClick={() => handleMenuClick(item)}
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
  );
};

export default Sidebar;