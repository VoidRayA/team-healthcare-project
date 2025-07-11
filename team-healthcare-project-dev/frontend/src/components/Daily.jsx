import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,  
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  MenuItem,
  Select,
  FormControl,  
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination
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
import SeniorSelectModal from './modals/SeniorSelectModal';
import CategoryManageModal from './modals/CategoryManageModal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getUserInfo, clearAuthData, getAuthToken } from '../utils/auth';

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
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [showPasswordModal, setShowPasswordModal] = useState(false); // ProfileManagement에서만 처리
  const [showSeniorSelectModal, setShowSeniorSelectModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 드롭다운 관련 상태
  const [dropdownItems, setDropdownItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  
  // 폼 데이터 (기존 체크박스용)
  const [formData, setFormData] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    sleepQuality: '',
    specialNotes: ''
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
    
    // 보호 대상자 목록 로드
    loadSeniors();
    // 드롭다운 데이터 로드
    fetchDropdownData();
  }, []);

  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('JWT 토큰이 없습니다. 더미 데이터를 사용합니다.');
        // 더미 데이터
        const dummySeniors = [
          { id: 1, seniorName: '김할머니', age: 78 },
          { id: 2, seniorName: '이할아버지', age: 82 },
          { id: 3, seniorName: '박할머니', age: 75 },
          { id: 4, seniorName: '최할아버지', age: 80 },
          { id: 5, seniorName: '정할머니', age: 77 }
        ];
        setSeniors(dummySeniors);
        if (dummySeniors.length > 0) {
          setSelectedSenior(dummySeniors[0]); // 첫 번째 Senior를 기본 선택
        }
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/seniors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // API 응답이 {content: []} 형태인 경우 처리
        const seniorsArray = data.content || data || [];
        
        setSeniors(seniorsArray);
        if (seniorsArray.length > 0) {
          setSelectedSenior(seniorsArray[0]); // 첫 번째 Senior를 기본 선택
        }
      } else {
        console.error('Senior 데이터 로드 실패:', response.status);
        // 실패 시 더미 데이터
        const fallbackSeniors = [
          { id: 1, seniorName: '김할머니', age: 78 },
          { id: 2, seniorName: '이할아버지', age: 82 }
        ];
        setSeniors(fallbackSeniors);
        if (fallbackSeniors.length > 0) {
          setSelectedSenior(fallbackSeniors[0]);
        }
      }
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
      // 오류 시 더미 데이터
      const errorFallback = [
        { id: 1, seniorName: '김할머니', age: 78 }
      ];
      setSeniors(errorFallback);
      if (errorFallback.length > 0) {
        setSelectedSenior(errorFallback[0]);
      }
    }
  };

  // 드롭다운 데이터 불러오기
  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        console.log('JWT 토큰이 없습니다. 더미 데이터를 사용합니다.');
        // 토큰이 없을 때 더미 데이터
        const dummyData = [
          '식사횟수', '운동시간', '복약여부', '건강상태', '활동수준'
        ];
        setDropdownItems(dummyData);
        
        const initialSelected = {};
        dummyData.forEach(itemValue => {
          initialSelected[itemValue] = '';
        });
        setSelectedItems(initialSelected);
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/user-settings/dropdown-items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('드롭다운 데이터 로드 성공:', data);
        
        // 백엔드에서 String 배열로 받아오므로 직접 사용
        // 유효한 문자열만 필터링
        const validItems = data.filter(item => item && typeof item === 'string' && item.trim() !== '');
        setDropdownItems(validItems);
        
        // 초기 선택값 설정
        const initialSelected = {};
        validItems.forEach(itemValue => {
          initialSelected[itemValue] = ''; // 기본값은 비워둔상태
        });
        setSelectedItems(initialSelected);
      } else {
        console.error('API 응답 오류:', response.status, response.statusText);
        throw new Error(`API 오류: ${response.status}`);
      }
      
    } catch (error) {
      console.error('드롭다운 데이터 불러오기 실패:', error);
      setError('드롭다운 데이터를 불러오는데 실패했습니다. 더미 데이터를 사용합니다.');
      
      // 오류 시 더미 데이터로 폴백
      const fallbackData = [
        {
          id: 1,
          subCategory: '식사횟수',
          values: '["1회", "2회", "3회", "4회", "5회"]'
        }
      ];
      setDropdownItems(fallbackData);
      
      const initialSelected = {};
      fallbackData.forEach(item => {
        try {
          const values = JSON.parse(item.values);
          initialSelected[item.subCategory] = values[0];
        } catch (e) {
          console.error('JSON 파싱 오류:', e);
        }
      });
      setSelectedItems(initialSelected);
    } finally {
      setLoading(false);
    }
  };

  // 드롭다운 값 변경 핸들러
  const handleItemChange = (subCategory, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [subCategory]: value
    }));
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
      const token = getAuthToken();
      
      const saveData = {
        selectedItems,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
        formData
      };
      
      console.log('저장할 데이터:', saveData);
      
      if (!token) {
        console.log('JWT 토큰이 없습니다. 로컬 저장만 수행합니다.');
        setSuccess('활동 기록이 저장되었습니다. (로컬)');
        return;
      }

      // 실제 API 호출
      const response = await fetch('http://localhost:8080/api/daily-activities/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('저장 성공:', result);
        setSuccess('활동 기록이 저장되었습니다.');
      } else {
        console.error('저장 API 오류:', response.status, response.statusText);
        throw new Error(`저장 실패: ${response.status}`);
      }
      
    } catch (error) {
      console.error('저장 오류:', error);
      setError('저장에 실패했습니다.');
    }
  };

  // 대상자 선택 핸들러
  const handleSeniorSelect = (senior) => {
    setSelectedSenior(senior);
    setShowSeniorSelectModal(false);
    console.log('선택된 대상자:', senior);
  };
  
  // 카테고리 업데이트 핸들러
  const handleCategoryUpdate = () => {
    console.log('카테고리 업데이트됨 - 드롭다운 새로고침');
    fetchDropdownData(); // 드롭다운 데이터 새로고침
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
      gap: '0px',
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
      }} elevation={0}>
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
                    // 직접 ProfileManagement로 이동 (모달은 ProfileManagement에서 처리)
                    navigate('/profile/management');
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
        </List>

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

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        overflow: 'auto',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }} elevation={0}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          gap: '30px'
        }}>
          {/* 상단 영역: 달력 + 활동기록 */}
          <Box sx={{
            display: 'flex',
            gap: '30px',
            height: 'fit-content'
          }}>
            {/* 달력 영역 */}
            <Box sx={{
              flex: '0 0 350px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <Typography variant="h2" sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '28px',
                color: '#0869CC',
                marginBottom: '20px'
              }}>
                일정 관리
              </Typography>

              <Box sx={{
                width: '320px',
                height: '280px',
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '15px',
                backgroundColor: '#fafafa',
                overflow: 'hidden',
                '& .react-calendar': {
                  width: '100%',
                  border: 'none',
                  fontFamily: 'Pretendard',
                  backgroundColor: 'transparent'
                },
                '& .react-calendar__navigation': {
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px'
                },
                '& .react-calendar__navigation button': {
                  minWidth: '36px',
                  height: '36px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '6px'
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
                  padding: '4px 4px',
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
                '& .react-calendar__month-view__days': {
                  display: 'grid !important',
                  gridTemplateColumns: 'repeat(7, 1fr) !important',
                  gap: '2px !important'
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
                  color: '#white',
                  border: '1px solid #1976d2'
                }
              }}>
                <Calendar
                  onChange={(date) => {
                    console.log('달력에서 선택된 날짜:', date);
                    setSelectedDate(date);
                  }}
                  value={selectedDate}
                  locale="ko-KR"
                  formatShortWeekday={(locale, date) => {
                    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                    return weekdays[date.getDay()];
                  }}
                  formatDay={(locale, date) => date.getDate().toString()}
                />
              </Box>
            </Box>

            {/* 활동기록 영역 */}
            <Paper sx={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '15px',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* 활동 기록 헤더 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#0869CC'
                }}>
                  {selectedSenior ? selectedSenior.seniorName : '대상자 선택'}님 활동 기록
                </Typography>

                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {new Date().toLocaleDateString('ko-KR')}
                </Typography>
              </Box>

              {/* 상단 액션 영역 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  color: '#0869CC',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => setShowCategoryModal(true)}
                >
                  + 항목 관리
                </Typography>

                <Button
                  onClick={handleSave}
                  sx={{
                    backgroundColor: '#00458B',
                    color: 'white',
                    fontFamily: 'Pretendard',
                    fontSize: '14px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#003366'
                    }
                  }}
                >
                  저장
                </Button>
              </Box>

              {/* 드롭다운 */}
              <Box>
                <FormControl fullWidth>
                  <Select
                    value={selectedItems[dropdownItems[0]] || ''}
                    onChange={(e) => handleItemChange(dropdownItems[0], e.target.value)}
                    displayEmpty
                    sx={{
                      fontFamily: 'Pretendard',
                      fontSize: '14px'
                    }}
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {dropdownItems.map((itemValue, index) => (
                      <MenuItem key={index} value={itemValue}>
                        {itemValue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 일일 특이사항 */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '16px',
                  marginBottom: '15px'
                }}>
                  일일 특이사항
                </Typography>
                <TextField
                  multiline
                  rows={5}
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  name="specialNotes"
                  placeholder="특이사항을 입력하세요..."
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'Pretendard',
                      fontSize: '14px'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>

          {/* 하단 영역: 보호 대상자 목록 */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <Typography variant="h6" sx={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '22px',
              color: '#0869CC',
              marginBottom: '15px'
            }}>
              보호 대상자 목록
            </Typography>
            
            {loading ? (
              <Typography sx={{ p: 2, textAlign: 'center' }}>로딩 중...</Typography>
            ) : seniors.length > 0 ? (
              <>
                <TableContainer component={Paper} sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0',
                  border: '2px solid #1976d2',
                  boxShadow: 'none'
                }}>
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
                        padding: '6px 6px',
                        height: '25px'
                      }
                    }}>
                      <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>나이</TableCell>
                        <TableCell>전화번호</TableCell>
                        <TableCell>주소</TableCell>
                        <TableCell>비상연락처</TableCell>
                        <TableCell>지병</TableCell>
                        <TableCell>복용 약물</TableCell>
                        <TableCell>특이사항</TableCell>
                        <TableCell>상태</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{
                      '& .MuiTableRow-root': {
                        '&:nth-of-type(even)': {
                          backgroundColor: '#f8f9fa'
                        },
                        '&.data-row:hover': {
                          backgroundColor: '#e3f2fd',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        },
                        '&.data-row.selected': {
                          backgroundColor: '#bbdefb !important',
                          '&:hover': {
                            backgroundColor: '#90caf9 !important'
                          }
                        },
                        '&:last-child': {
                          '& .MuiTableCell-root': {
                            borderBottom: 'none'
                          }
                        }
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid #1976d2',
                        fontFamily: 'Pretendard',
                        fontSize: '12px',
                        color: '#333',
                        textAlign: 'center',
                        padding: '6px 6px',
                        height: '25px'
                      }
                    }}>
                      {seniors.map((senior, index) => (
                        <TableRow 
                          key={senior.id}
                          className="data-row"
                          onClick={() => {
                            console.log('선택된 Senior:', senior);
                            setSelectedSenior(senior);
                          }}
                          sx={{
                            backgroundColor: selectedSenior && selectedSenior.id === senior.id ? '#bbdefb !important' : 'inherit'
                          }}
                        >
                          <TableCell>{senior.seniorName}</TableCell>
                          <TableCell>{senior.age ? `${senior.age}세` : '-'}</TableCell>
                          <TableCell>{senior.phoneNumber || '-'}</TableCell>
                          <TableCell>{senior.address || '-'}</TableCell>
                          <TableCell>{senior.emergencyContact || '-'}</TableCell>
                          <TableCell>{senior.medicalConditions || '-'}</TableCell>
                          <TableCell>{senior.medications || '-'}</TableCell>
                          <TableCell>{senior.specialNotes || '-'}</TableCell>
                          <TableCell 
                            sx={{
                              color: selectedSenior && selectedSenior.id === senior.id ? '#1976d2' : '#666',
                              fontWeight: selectedSenior && selectedSenior.id === senior.id ? 'bold' : 'normal'
                            }}
                          >
                            {selectedSenior && selectedSenior.id === senior.id ? '선택됨' : '대기'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* 빈 행들 (디자인을 위해) */}
                      {Array.from({ length: Math.max(0, 6 - seniors.length) }).map((_, index) => (
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
                    count={1}
                    page={1}
                    onChange={(event, page) => console.log('Page changed to:', page)}
                    color="primary"
                    showFirstButton 
                    showLastButton
                  />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    1/1
                  </Typography>
                </Box>
              </>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', border: '2px solid #1976d2' }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  color: '#666666',
                  fontSize: '16px'
                }}>
                  등록된 보호 대상자가 없습니다.
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 대상자 선택 모달 */}
      <SeniorSelectModal
        open={showSeniorSelectModal}
        onClose={() => setShowSeniorSelectModal(false)}
        onSelect={handleSeniorSelect}
        selectedSenior={selectedSenior}
      />
      
      {/* 카테고리 관리 모달 */}
      <CategoryManageModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onUpdate={handleCategoryUpdate}
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
    </Box>
  );
};

export default Daily;