import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  EditOutlined
} from '@mui/icons-material';
import userImage from '../images/user.png';

// 홈 화면과 동일한 스타일 구조
const MainContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#CCE5FF',
  display: 'flex',  
  gap: '0px',
  overflow: 'hidden'
});

const ContentContainer = styled(Paper)({
  backgroundColor: '#ffffff',  
  flex: 1,
  display: 'flex',
  overflow: 'auto',
  margin: '1vw 1vw 1vw 240px',
  height: 'calc(100vh - 2vw)',
  minHeight: 'calc(100vh - 2vw)'
});

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

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '40px'
});

const HeaderSection = styled(Box)({
  marginBottom: '40px'
});

const ProfileEditCard = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '15px',
  padding: '40px',
  maxWidth: '800px',
  margin: '0 auto'
});

const StyledTextField = styled(TextField)({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    height: '55px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: '#1976d2'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px'
    }
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    color: '#333',
    padding: '0 15px'
  }
});

const StyledFormControl = styled(FormControl)({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    height: '55px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: '#1976d2'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px'
    }
  }
});

const UpdateButton = styled(Button)({
  height: '50px',
  backgroundColor: '#1976d2',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  marginRight: '10px',
  minWidth: '120px',
  '&:hover': {
    backgroundColor: '#1565c0'
  }
});

const CancelButton = styled(Button)({
  height: '50px',
  backgroundColor: '#666',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  minWidth: '120px',
  '&:hover': {
    backgroundColor: '#555'
  }
});

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('회원정보 관리');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  const [formData, setFormData] = useState({
    loginId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    guardianName: '',
    phone: '',
    email: '',
    relationship: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 컴포넌트 마운트시 현재 사용자 정보 로드
  useEffect(() => {
    loadGuardianInfo();
    loadCurrentUserInfo();
  }, []);

  const loadGuardianInfo = () => {
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
  };

  const loadCurrentUserInfo = async () => {
    try {
      setInitialLoading(true);
      
      const currentLoginId = localStorage.getItem('loginId');
      if (!currentLoginId) {
        setError('로그인 정보를 찾을 수 없습니다.');
        navigate('/');
        return;
      }

      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('로그인이 필요합니다.');
        navigate('/');
        return;
      }

      // 임시로 localStorage 정보 사용
      const guardianName = localStorage.getItem('guardianName');
      
      setFormData({
        loginId: currentLoginId,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        guardianName: guardianName || '',
        phone: '',
        email: '',
        relationship: ''
      });

    } catch (err) {
      console.error('사용자 정보 로드 오류:', err);
      setError('사용자 정보를 불러올 수 없습니다.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.guardianName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return false;
    }

    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('전화번호는 숫자와 하이픈만 입력 가능합니다.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (!formData.relationship.trim()) {
      setError('관계를 선택해주세요.');
      return false;
    }

    if (formData.newPassword.trim()) {
      if (!formData.currentPassword.trim()) {
        setError('비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.');
        return false;
      }

      if (formData.newPassword.length < 6) {
        setError('새 비밀번호는 6자 이상이어야 합니다.');
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('새 비밀번호가 일치하지 않습니다.');
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('로그인이 필요합니다.');
        navigate('/');
        return;
      }

      const updateData = {
        guardianName: formData.guardianName,
        phone: formData.phone,
        email: formData.email,
        relationship: formData.relationship
      };

      if (formData.newPassword.trim()) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      console.log('회원정보 수정 요청 데이터:', updateData);

      // TODO: 백엔드 API 호출
      // const response = await axios.put('http://localhost:8080/api/guardian/profile', updateData, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      setSuccess('회원정보가 성공적으로 수정되었습니다!');
      
      // 비밀번호 관련 필드 초기화
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error('회원정보 수정 에러:', err);
      setError('회원정보 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('loginId');
    localStorage.removeItem('guardianName');
    localStorage.removeItem('role');
    
    alert('로그아웃 되었습니다.');
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

  // 초기 로딩 중
  if (initialLoading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress size={50} />
          <Typography sx={{ ml: 2 }}>사용자 정보를 불러오는 중...</Typography>
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      {/* 사이드바 */}
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

        <SidebarMenu>
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
        <MainContent>
          {/* 헤더 */}
          <HeaderSection>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
              회원정보 관리
            </Typography>
            <Typography variant="body1" color="text.secondary">
              개인정보를 안전하게 관리하세요.
            </Typography>
          </HeaderSection>

          {/* 회원정보 수정 폼 */}
          <ProfileEditCard elevation={0}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
              ✏️ 회원정보 수정
            </Typography>

            {/* 아이디 (읽기 전용) */}
            <StyledTextField
              variant="outlined"
              label="로그인 아이디"
              name="loginId"
              fullWidth
              value={formData.loginId}
              disabled
              sx={{
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  backgroundColor: '#f8f9fa',
                  color: '#495057'
                },
                '& .MuiInputLabel-root.Mui-disabled': {
                  color: '#6c757d'
                }
              }}
            />

            {/* 이름 */}
            <StyledTextField
              variant="outlined"
              label="이름"
              name="guardianName"
              fullWidth
              value={formData.guardianName}
              onChange={handleChange}
            />

            {/* 전화번호 */}
            <StyledTextField
              variant="outlined"
              label="전화번호"
              placeholder="010-1234-5678"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />

            {/* 이메일 */}
            <StyledTextField
              variant="outlined"
              label="이메일"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />

            {/* 관계 */}
            <StyledFormControl fullWidth>
              <InputLabel>관계</InputLabel>
              <Select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                label="관계"
              >
                <MenuItem value="아버지">아버지</MenuItem>
                <MenuItem value="어머니">어머니</MenuItem>
                <MenuItem value="아들">아들</MenuItem>
                <MenuItem value="딸">딸</MenuItem>
                <MenuItem value="며느리">며느리</MenuItem>
                <MenuItem value="사위">사위</MenuItem>
                <MenuItem value="손자">손자</MenuItem>
                <MenuItem value="손녀">손녀</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </StyledFormControl>

            {/* 비밀번호 변경 섹션 */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#333',
                mt: 4,
                mb: 2,
                borderTop: '1px solid #e0e0e0',
                paddingTop: '20px'
              }}
            >
              🔒 비밀번호 변경 (선택사항)
            </Typography>

            {/* 현재 비밀번호 */}
            <StyledTextField
              variant="outlined"
              label="현재 비밀번호"
              placeholder="변경시에만 입력"
              name="currentPassword"
              type="password"
              fullWidth
              value={formData.currentPassword}
              onChange={handleChange}
            />

            {/* 새 비밀번호 */}
            <StyledTextField
              variant="outlined"
              label="새 비밀번호"
              placeholder="6자 이상"
              name="newPassword"
              type="password"
              fullWidth
              value={formData.newPassword}
              onChange={handleChange}
            />

            {/* 새 비밀번호 확인 */}
            <StyledTextField
              variant="outlined"
              label="새 비밀번호 확인"
              name="confirmPassword"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* 버튼 영역 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <UpdateButton
                variant="contained"
                onClick={handleUpdate}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? '수정 중...' : '정보 수정'}
              </UpdateButton>

              <CancelButton
                variant="contained"
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </CancelButton>
            </Box>

            {/* 메시지 표시 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </ProfileEditCard>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default ProfileEdit;