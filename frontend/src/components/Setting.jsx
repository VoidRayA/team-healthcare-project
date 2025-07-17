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
import userImage from '../images/user.png';
import { getUserInfo, clearAuthData } from '../utils/auth';

const Setting = () => {


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
                      setActiveMenu(item.text);
                    } else if (item.text === '홈') {
                      navigate('/home');
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
      </Box>
  )
}

export default Setting;