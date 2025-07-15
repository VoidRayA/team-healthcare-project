import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ListItemText,
  CircularProgress,
  InputAdornment,
  IconButton,  
  Alert,
  TableSortLabel
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,  
  EventOutlined,  
  LogoutOutlined,
  EditOutlined,  
  ClearOutlined,  
  SettingsOutlined
} from '@mui/icons-material';
import userImage from '../images/user.png';
import { getUserInfo, clearAuthData } from '../utils/auth';
import { getSeniorsWithPagination } from '../api/apiClient';

const SeniorList = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('보호 대상자');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    const userInfo = getUserInfo();
    
    if (userInfo) {
      setGuardianInfo({
        name: userInfo.name,
        loginId: userInfo.loginId,
        role: userInfo.role || 'GUARDIAN'
      });
    }
    
    loadSeniors();
  }, [currentPage, orderBy, order]);

  // seniors가 변경될 때마다 displayedSeniors 업데이트
  const displayedSeniors = useMemo(() => {
    const displayed = [...seniors];
    
    // 항상 10개 행을 유지하기 위해 빈 객체 추가
    while (displayed.length < 10) {
      displayed.push({ 
        id: `empty-${displayed.length}`, 
        isEmpty: true,
        name: '', 
        birthDate: '', 
        gender: '', 
        address: '', 
        phone: '', 
        emergencyContact: '', 
        medicalConditions: '', 
        medications: '', 
        specialNotes: '' 
      });
    }
    
    return displayed;
  }, [seniors]);

  const loadSeniors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSeniorsWithPagination(currentPage - 1, pageSize, `${orderBy},${order}`);
      console.log('Senior 목록 응답:', response);
      
      if (response.content) {
        const formattedSeniors = response.content.map(senior => ({
          id: senior.id,
          name: senior.seniorName,
          birthDate: formatDate(senior.birthDate),
          gender: senior.gender === 'MALE' ? '남' : '여',
          address: senior.address || '-',
          phone: formatPhoneNumber(senior.phone),
          emergencyContact: formatPhoneNumber(senior.emergencyContact),
          medicalConditions: senior.chronicDiseases || '-',
          medications: senior.medications || '-',
          specialNotes: senior.notes || '-'
        }));
        setSeniors(formattedSeniors);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
      setError('보호 대상자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    const numbers = phone.replace(/[^0-9]/g, '');
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    if (searchQuery.trim()) {
      setLoading(true);
      setError(null);
      try {
        // 임시로 프론트엔드 필터링 사용
        const response = await getSeniorsWithPagination(0, 100, `${orderBy},${order}`);
        if (response.content) {
          const allSeniors = response.content.map(senior => ({
            id: senior.id,
            name: senior.seniorName,
            birthDate: formatDate(senior.birthDate),
            gender: senior.gender === 'MALE' ? '남' : '여',
            address: senior.address || '-',
            phone: formatPhoneNumber(senior.phone),
            emergencyContact: formatPhoneNumber(senior.emergencyContact),
            medicalConditions: senior.chronicDiseases || '-',
            medications: senior.medications || '-',
            specialNotes: senior.notes || '-'
          }));
          
          const filtered = allSeniors.filter(senior => 
            senior.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            senior.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
            senior.phone.includes(searchQuery)
          );
          
          setSeniors(filtered.slice(0, pageSize));
          setTotalElements(filtered.length);
          setTotalPages(Math.ceil(filtered.length / pageSize));
        }
      } catch (error) {
        console.error('검색 중 오류:', error);
        setError('검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      loadSeniors();
    }
  };

  const handleAddSenior = () => {
    navigate('/sjoin');
  };

  const handleRowClick = (seniorId) => {
    navigate(`/senior/edit/${seniorId}`);
  };

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setCurrentPage(1);
  }, [orderBy, order]);

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
            <TextField
              placeholder="이름, 주소, 전화번호로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                    opacity: 0.7
                  }
                }
              }}
              InputProps={{
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearOutlined />
                    </IconButton>
                  </InputAdornment>
                )
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

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, height: '48px', display: 'flex', alignItems: 'center' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 테이블 영역 - 반응형 높이 */}
          <Box sx={{ 
            height: { 
              xs: '350px', 
              sm: '400px', 
              md: '450px', 
              lg: '472px' 
            }, 
            mb: 2 
          }}>

          {/* 테이블 */}
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              backgroundColor: '#ffffff',
              border: '2px solid #1976d2'
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer 
              component={Paper}
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: 0,
                border: '2px solid #1976d2',
                boxShadow: 'none',
                height: { 
                  xs: '350px', 
                  sm: '400px', 
                  md: '450px', 
                  lg: '470px' 
                },
                overflow: 'auto',
                maxHeight: '469px'
                // 최소 너비 제거로 반응형 개선
              }}
            >
              <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead sx={{
                  '& .MuiTableCell-root': {
                    backgroundColor: 'rgba(51, 153, 255, 0.3)',
                    borderBottom: '2px solid #1976d2',
                    fontFamily: 'Pretendard',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#000',
                    textAlign: 'center',
                    padding: '10px 4px',
                    height: '25px'
                  }
                }}>
                  <TableRow>
                    <TableCell sx={{ width: '6%', textAlign: 'center' }}>
                      <TableSortLabel
                        active={orderBy === 'seniorName'}
                        direction={orderBy === 'seniorName' ? order : 'asc'}
                        onClick={() => handleRequestSort('seniorName')}
                        sx={{ 
                          width: '100%', 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        이름
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ width: '10%', textAlign: 'center' }}>
                      <TableSortLabel
                        active={orderBy === 'birthDate'}
                        direction={orderBy === 'birthDate' ? order : 'asc'}
                        onClick={() => handleRequestSort('birthDate')}
                        sx={{ 
                          width: '100%', 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        생년월일
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ width: '5%' }}>성별</TableCell>
                    <TableCell sx={{ width: '20%', textAlign: 'center' }}>
                      <TableSortLabel
                        active={orderBy === 'address'}
                        direction={orderBy === 'address' ? order : 'asc'}
                        onClick={() => handleRequestSort('address')}
                        sx={{ 
                          width: '100%', 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        주소
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ width: '13%', display: { xs: 'none', md: 'table-cell' } }}>보호 대상자 연락처</TableCell>
                    <TableCell sx={{ width: '13%' }}>비상연락처</TableCell>
                    <TableCell sx={{ width: '12%', display: { xs: 'none', sm: 'table-cell' } }}>지병</TableCell>
                    <TableCell sx={{ width: '13%', display: { xs: 'none', sm: 'table-cell' } }}>복용 약물</TableCell>
                    <TableCell sx={{ width: '11%', display: { xs: 'none', md: 'table-cell' } }}>특이사항</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{
                  '& .MuiTableRow-root': {
                    transition: 'background-color 0.15s ease',
                    '&:nth-of-type(even)': {
                      backgroundColor: '#f8f9fa'
                    },
                    '&.data-row:hover': {
                      backgroundColor: '#e3f2fd',
                      cursor: 'pointer'
                    },
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
                    padding: '8px 4px',
                    height: '25px',
                    transition: 'all 0.15s ease'
                  }
                }}>
                  {displayedSeniors.map((senior) => (
                    <TableRow 
                      key={senior.id}
                      className={senior.isEmpty ? "" : "data-row"}
                      onClick={() => {
                        if (!senior.isEmpty) {
                          handleRowClick(senior.id);
                        }
                      }}
                      sx={{
                        cursor: senior.isEmpty ? 'default' : 'pointer',
                        '&:hover': {
                          backgroundColor: senior.isEmpty ? 'inherit' : '#e3f2fd'
                        },
                        '& .MuiTableCell-root': {
                          userSelect: senior.isEmpty ? 'none' : 'auto',
                          pointerEvents: senior.isEmpty ? 'none' : 'auto'
                        }
                      }}
                    >
                      <TableCell>{senior.name}</TableCell>
                      <TableCell>{senior.birthDate}</TableCell>
                      <TableCell>{senior.gender}</TableCell>
                      <TableCell 
                        sx={{ 
                          whiteSpace: { xs: 'normal', lg: 'nowrap' },
                          overflow: { xs: 'visible', lg: 'hidden' },
                          textOverflow: { xs: 'clip', lg: 'ellipsis' },
                          maxWidth: { xs: 'none', lg: '200px' }
                        }}
                      >
                        {senior.address}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{senior.phone}</TableCell>
                      <TableCell>{senior.emergencyContact}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{senior.medicalConditions}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{senior.medications}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{senior.specialNotes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </Box>

          {/* 페이지네이션 */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '5px',
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
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SeniorList;