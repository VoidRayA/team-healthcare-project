import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
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

// Home.jsx와 동일한 스타일 구조
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

// 메인 콘텐츠 - ProfileManagement와 동일
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '40px'
});

// ProfileManagement와 동일한 폼 컨테이너
const FormContainer = styled(Box)({
  width: '100%',
  maxWidth: '900px',
  backgroundColor: 'transparent',
  padding: '40px',
  position: 'relative'
});

// 헤더 섹션 - ProfileManagement 스타일
const HeaderSection = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '32px',
  color: '#000000',
  textAlign: 'center',
  marginBottom: '40px'
});

// Figma 디자인과 동일한 입력 행 - ProfileManagement 사이즈 적용
const InputRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  height: '60px',
  borderBottom: '1px solid #0869CC',
  '&:first-of-type': {
    borderTop: '4px solid #00458B'
  }
});

// 라벨 섹션 (왼쪽 파란색 배경) - ProfileManagement 사이즈
const LabelSection = styled(Box)({
  width: '200px',
  height: '100%',
  backgroundColor: 'rgba(51, 153, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '18px',
  color: '#000000'
});

// 입력 섹션 (오른쪽 흰색 배경) - ProfileManagement 사이즈
const InputSection = styled(Box)({
  flex: 1,
  height: '100%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '24px',
  paddingRight: '24px'
});

// 텍스트 필드 스타일
const StyledTextField = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    border: 'none',
    '& fieldset': {
      border: 'none'
    },
    '&:hover fieldset': {
      border: 'none'
    },
    '&.Mui-focused fieldset': {
      border: 'none'
    }
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Pretendard',
    fontWeight: 500,
    fontSize: '16px',
    color: '#333',
    padding: '0',
    '&::placeholder': {
      color: '#B4B4B4',
      opacity: 1
    }
  }
});

// 라디오 버튼 스타일
const StyledRadioGroup = styled(RadioGroup)({
  display: 'flex',
  flexDirection: 'row',
  gap: '20px',
  '& .MuiFormControlLabel-root': {
    '& .MuiFormControlLabel-label': {
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '16px',
      color: '#333'
    }
  }
});

// 등록 버튼 - ProfileManagement UpdateButton 스타일
const RegisterButton = styled(Button)({
  width: '200px',
  height: '60px',
  backgroundColor: '#0869CC',
  borderRadius: '30px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px',
  color: '#FFFFFF',
  textTransform: 'none',
  margin: '40px auto 0 auto',
  display: 'block',
  '&:hover': {
    backgroundColor: '#0653A3'
  },
  '&:disabled': {
    backgroundColor: '#ccc'
  }
});

const Sjoinpage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL 파라미터에서 ID 가져오기
  const isEditMode = Boolean(id); // ID가 있으면 수정 모드
  
  const [activeMenu, setActiveMenu] = useState('보호 대상자');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  const [formData, setFormData] = useState({
    seniorName: '',
    birthDate: '',
    calendarType: '양력',
    gender: '남성',
    address: '',
    phone: '',
    emergencyContact: '',
    medicalConditions: '',
    medications: '',
    specialNotes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    // 수정 모드일 때 기존 데이터 로드
    if (isEditMode && id) {
      loadSeniorData(id);
    }
  }, [isEditMode, id]);

  // 수정 모드일 때 기존 데이터 로드
  const loadSeniorData = async (seniorId) => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출
      // const response = await getSeniorById(seniorId);
      
      // API가 준비되면 여기에 실제 데이터 로드 로직 추가
      console.log('보호 대상자 데이터 로드 기다리는 중...', seniorId);
      
      // 임시로 빈 데이터 표시
      setError('데이터를 불러오는 기능이 준비 중입니다.');
      
    } catch (err) {
      console.error('보호 대상자 데이터 로드 오류:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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
    if (!formData.seniorName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.birthDate.trim()) {
      setError('생년월일을 입력해주세요.');
      return false;
    }
    if (!formData.address.trim()) {
      setError('주소를 입력해주세요.');
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      setError('비상 연락처를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
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

      // TODO: 백엔드 API 호출
      console.log('Senior 등록/수정 데이터:', formData);
      
      // 임시 성공 처리
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(isEditMode ? '보호 대상자 정보가 성공적으로 수정되었습니다!' : '보호 대상자가 성공적으로 등록되었습니다!');
      
      if (!isEditMode) {
        // 등록 모드일 때만 폼 초기화
        setFormData({
          seniorName: '',
          birthDate: '',
          calendarType: '양력',
          gender: '남성',
          address: '',
          phone: '',
          emergencyContact: '',
          medicalConditions: '',
          medications: '',
          specialNotes: ''
        });
      }
      
      // 3초 후 보호 대상자 리스트로 이동
      setTimeout(() => {
        navigate('/seniors');
      }, 2000);
      
    } catch (err) {
      console.error('Senior 등록 오류:', err);
      setError('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

  return (
    <MainContainer>
      {/* 사이드바 - Home.jsx와 완전히 동일 */}
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
                  if (item.text === '홈') {
                    navigate('/home');
                  } else if (item.text === '회원정보 관리') {
                    navigate('/profile/management');
                  } else if (item.text === '보호 대상자') {
                    navigate('/seniors');
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
          <FormContainer>
            {/* 헤더 */}
            <HeaderSection>
              {isEditMode ? '보호 대상자 정보 수정' : '보호 대상자 정보 입력'}
            </HeaderSection>

            {/* Figma와 동일한 테이블 형태 폼 */}
            <Box>
              {/* 이름 */}
              <InputRow>
                <LabelSection>이름</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="seniorName"
                    value={formData.seniorName}
                    onChange={handleChange}
                    placeholder="ex) 홍길동"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 생년월일 */}
              <InputRow>
                <LabelSection>생년월일</LabelSection>
                <InputSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                    <StyledTextField
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      placeholder="ex) 19820909"
                      variant="outlined"
                      sx={{ flex: 1 }}
                    />
                    <FormControl component="fieldset">
                      <StyledRadioGroup
                        name="calendarType"
                        value={formData.calendarType || '양력'}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="음력" control={<Radio />} label="음력" />
                        <FormControlLabel value="양력" control={<Radio />} label="양력" />
                      </StyledRadioGroup>
                    </FormControl>
                  </Box>
                </InputSection>
              </InputRow>

              {/* 성별 */}
              <InputRow>
                <LabelSection>성별</LabelSection>
                <InputSection>
                  <FormControl component="fieldset">
                    <StyledRadioGroup
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    >
                    <FormControlLabel value="남성" control={<Radio />} label="남성" />
                    <FormControlLabel value="여성" control={<Radio />} label="여성" />
                    </StyledRadioGroup>
                  </FormControl>
                </InputSection>
              </InputRow>

              {/* 주소 */}
              <InputRow>
                <LabelSection>주소</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="ex) 주소를 입력해주세요"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 보호 대상자 연락처 */}
              <InputRow>
                <LabelSection>보호 대상자 연락처</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="ex) 01012345678"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 비상 연락처 */}
              <InputRow>
                <LabelSection>비상 연락처</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="ex) 01012345678 (보호자, 가족, 이웃 등)"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 주요 지병 */}
              <InputRow>
                <LabelSection>주요 지병</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    placeholder="ex) 주요 지병을 입력해주세요"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 복용중인 주요 약물 */}
              <InputRow>
                <LabelSection>복용중인 주요 약물</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="ex) 복용중인 주요 약물이 있다면 입력해주세요"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>

              {/* 특이 사항 */}
              <InputRow>
                <LabelSection>특이 사항</LabelSection>
                <InputSection>
                  <StyledTextField
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    placeholder="ex) 특이사항을 입력해주세요"
                    variant="outlined"
                  />
                </InputSection>
              </InputRow>
            </Box>

            {/* 등록/수정 버튼 */}
            <RegisterButton
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '수정하기' : '등록하기')}
            </RegisterButton>

            {/* 메시지 표시 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2, maxWidth: '600px', margin: '20px auto 0 auto' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2, maxWidth: '600px', margin: '20px auto 0 auto' }}>
                {success}
              </Alert>
            )}
          </FormContainer>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default Sjoinpage;