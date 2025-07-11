import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,  
  Pagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
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
// import PasswordConfirmModal from './PasswordConfirmModal'; // ProfileManagement에서만 사용
import { getUserInfo, clearAuthData } from '../utils/auth';

const SeniorList = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('보호 대상자');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  const [searchFilter, setSearchFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1); // 실제 데이터에 따라 동적으로 설정
  // const [showPasswordModal, setShowPasswordModal] = useState(false); // ProfileManagement에서만 처리

  useEffect(() => {
    const userInfo = getUserInfo();
    
    if (userInfo) {
      setGuardianInfo({
        name: userInfo.name,
        loginId: userInfo.loginId,
        role: userInfo.role || 'GUARDIAN'
      });
    }
    
    // 보호 대상자 목록 로드
    loadSeniors();
  }, []);

  const loadSeniors = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      // const response = await getSeniors();
      
      // API가 준비되면 여기에 실제 데이터 로드 로직 추가
      console.log('데이터 로드 기다리는 중...');
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('검색:', searchFilter, searchQuery);
    // TODO: 검색 로직 구현
  };

  const handleAddSenior = () => {
    navigate('/sjoin');
  };

  // 보호 대상자 수정 페이지로 이동
  const handleRowClick = (seniorId) => {
    navigate(`/senior/edit/${seniorId}`);
  };

  const handleLogout = () => {
    clearAuthData();
    
    alert('로그아웃 되었습니다.');
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('authStateChange'));
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
                  if (item.text === '홈') {
                    navigate('/home');
                  } else if (item.text === '회원정보 관리') {                    
                    navigate('/profile/management');
                  } else if (item.text === '보호 대상자') {
                    setActiveMenu(item.text);
                  } else if (item.text === '일정 관리') {
                    navigate('/daily');
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

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        overflow: 'auto',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px 30px'
        }}>
          {/* 페이지 제목 */}
          <Typography sx={{
            fontFamily: 'Pretendard',
            fontWeight: 700,
            fontSize: '28px',
            color: '#1976d2',
            marginBottom: '20px'
          }}>
            보호 대상자 리스트
          </Typography>
          
          {/* 검색 영역 */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '15px',
            padding: '10px 0'
          }}>
            <Button 
              onClick={() => setSearchFilter('항목')}
              sx={{
                height: '40px',
                minWidth: '80px',
                backgroundColor: searchFilter === '항목' ? '#00458B' : '#FFFFFF',
                color: searchFilter === '항목' ? '#FFFFFF' : '#003C78',
                border: '1px solid #00458B',
                borderRadius: '5px',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: searchFilter === '항목' ? '#003366' : '#f0f8ff'
                }
              }}
            >
              항목
            </Button>
            <Button 
              onClick={() => setSearchFilter('종류')}
              sx={{
                height: '40px',
                minWidth: '80px',
                backgroundColor: searchFilter === '종류' ? '#00458B' : '#FFFFFF',
                color: searchFilter === '종류' ? '#FFFFFF' : '#003C78',
                border: '1px solid #00458B',
                borderRadius: '5px',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: searchFilter === '종류' ? '#003366' : '#f0f8ff'
                }
              }}
            >
              종류
            </Button>
            <TextField
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '5px',
                  '& fieldset': {
                    borderColor: '#00458B'
                  },
                  '&:hover fieldset': {
                    borderColor: '#00458B'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00458B'
                  }
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#003C78',
                  '&::placeholder': {
                    color: '#003C78',
                    opacity: 1
                  }
                }
              }}
            />
            <Button 
              onClick={handleSearch}
              sx={{
                height: '40px',
                minWidth: '70px',
                backgroundColor: '#007EFF',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#0066CC'
                }
              }}
            >
              찾기
            </Button>
            <Button 
              onClick={handleAddSenior}
              sx={{
                height: '40px',
                minWidth: '70px',
                backgroundColor: '#00458B',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#003366'
                }
              }}
            >
              추가
            </Button>
          </Box>

          {/* 테이블 */}
          <TableContainer 
            component={Paper}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 0,
              border: '2px solid #1976d2',
              boxShadow: 'none'
            }}
          >
            <Table>
              <TableHead sx={{
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
              }}>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>생년월일</TableCell>
                  <TableCell>성별</TableCell>
                  <TableCell>주소</TableCell>
                  <TableCell>보호 대상자 연락처</TableCell>
                  <TableCell>비상연락처</TableCell>
                  <TableCell>지병</TableCell>
                  <TableCell>복용 약물</TableCell>
                  <TableCell>특이사항</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{
                '& .MuiTableRow-root': {
                  '&:nth-of-type(even)': {
                    backgroundColor: '#f8f9fa'
                  },
                  // 데이터가 있는 행만 호버 효과 적용
                  '&.data-row:hover': {
                    backgroundColor: '#e3f2fd',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  },
                  // 5행마다 굵은 구분선 (마지막 행 제외)
                  '&:nth-of-type(5):not(:last-child)': {
                    '& .MuiTableCell-root': {
                      borderBottom: '3px solid #1976d2'
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
              }}>
                {seniors.map((senior) => (
                  <TableRow 
                    key={senior.id}
                    className="data-row"
                    onClick={() => handleRowClick(senior.id)}
                  >
                    <TableCell>{senior.name}</TableCell>
                    <TableCell>{senior.birthDate}</TableCell>
                    <TableCell>{senior.gender}</TableCell>
                    <TableCell>{senior.address}</TableCell>
                    <TableCell>{senior.phone}</TableCell>
                    <TableCell>{senior.emergencyContact}</TableCell>
                    <TableCell>{senior.medicalConditions}</TableCell>
                    <TableCell>{senior.medications}</TableCell>
                    <TableCell>{senior.specialNotes}</TableCell>
                  </TableRow>
                ))}
                {Array.from({ length: Math.max(0, 10 - seniors.length) }).map((_, index) => (
                  <TableRow 
                    key={`empty-${index}`}
                    sx={{
                      '& .MuiTableCell-root': {
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '15px',
            padding: '10px 0',
            gap: '8px'
          }}>
            <Pagination 
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
              showFirstButton 
              showLastButton
            />
            <Typography variant="body2" sx={{ color: '#666' }}>
              {currentPage}/{totalPages}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SeniorList;