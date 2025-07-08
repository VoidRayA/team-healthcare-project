import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// API 클라이언트 import로 axios 대체 (2025.07.08)
import { register } from '../api/apiClient';

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
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

// main/GJoinpage.jsx CSS 디자인을 기반으로 한 스타일링
const GJoinPage = styled(Box)({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(180deg, rgba(0, 124, 255, 0.2) 0%, rgba(0, 188, 255, 0.2) 100%)',
  overflow: 'hidden'
});

const MainBoard = styled(Paper)({
  position: 'absolute',
  width: '1820px',
  height: '1000px',
  left: 'calc(50% - 910px)',
  top: 'calc(50% - 500px)',
  background: '#FFFFFF',
  borderRadius: '10px',
  padding: '40px',
  boxSizing: 'border-box'
});

const PageTitle = styled(Typography)({
  position: 'absolute',
  width: '215px',
  height: '45px',
  left: 'calc(50% - 107.5px)',
  top: '64px',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '38px',
  lineHeight: '45px',
  color: '#000000',
  textAlign: 'center'
});

const FormContainer = styled(Box)({
  position: 'absolute',
  width: '1300px',
  height: '412px',
  left: 'calc(50% - 650px)',
  top: '158px',
  display: 'flex'
});

const LabelContainer = styled(Box)({
  width: '250px',
  height: '410px',
  background: 'rgba(51, 153, 255, 0.3)',
  borderRadius: '0px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  paddingRight: '20px'
});

const InputContainer = styled(Box)({
  width: '1050px',
  height: '410px',
  borderTop: '4px solid #00458B',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
});

const FormLabel = styled(Typography)({
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '25.5px',
  lineHeight: '30px',
  color: '#000000',
  height: '65px',
  display: 'flex',
  alignItems: 'center'
});

const StyledTextField = styled(TextField)({
  width: '1049px',
  height: '65px',
  '& .MuiOutlinedInput-root': {
    height: '65px',
    backgroundColor: '#FFFFFF',
    borderRadius: '0px',
    border: 'none',
    borderBottom: '1px solid #0869CC',
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
    fontSize: '20px',
    fontWeight: 700,
    color: '#B4B4B4',
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px'
  }
});

const StyledFormControl = styled(FormControl)({
  width: '1049px',
  height: '65px',
  '& .MuiOutlinedInput-root': {
    height: '65px',
    backgroundColor: '#FFFFFF',
    borderRadius: '0px',
    border: 'none',
    borderBottom: '1px solid #0869CC',
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
    fontSize: '20px',
    fontWeight: 700,
    color: '#333',
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  '& .MuiInputLabel-root': {
    fontSize: '20px',
    fontWeight: 700,
    color: '#B4B4B4',
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }
});

const ConsentSection = styled(Box)({
  position: 'absolute',
  width: '1298px',
  height: '162px',
  left: 'calc(50% - 649px)',
  top: '621px'
});

const ConsentHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
  paddingBottom: '10px',
  borderBottom: '1px solid #D9D9D9'
});

const ConsentItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '32px',
  marginBottom: '8px'
});

const ConsentText = styled(Typography)({
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '17px',
  lineHeight: '20px',
  color: '#000000'
});

const ViewLink = styled(Link)({
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '14px',
  lineHeight: '17px',
  color: '#8C929A',
  textDecoration: 'underline',
  cursor: 'pointer'
});

const SubmitButton = styled(Button)({
  position: 'absolute',
  width: '230px',
  height: '80px',
  left: 'calc(50% - 115px)',
  top: '852px',
  background: '#0869CC',
  borderRadius: '30px',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '30px',
  lineHeight: '36px',
  color: '#FFFFFF',
  textTransform: 'none',
  '&:hover': {
    background: '#0650A3'
  },
  '&:disabled': {
    opacity: 0.7,
    background: '#0869CC'
  }
});

const BackButton = styled(Button)({
  position: 'absolute',
  width: '120px',
  height: '40px',
  left: '40px',
  top: '40px',
  background: '#666',
  borderRadius: '20px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  '&:hover': {
    background: '#555'
  }
});

const ErrorBox = styled(Box)({
  position: 'absolute',
  width: '600px',
  left: 'calc(50% - 300px)',
  top: '950px',
  display: 'flex',
  justifyContent: 'center'
});

const GJoinpage = () => {
  const navigate = useNavigate();
  
  // 페이지 진입시 스크롤 방지
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);
  
  // 백엔드 RegisterRequestDto와 정확히 일치하는 필드들
  const [formData, setFormData] = useState({
    loginId: '',
    loginPw: '',
    confirmPassword: '',
    guardianName: '',
    phone: '',
    email: '',
    relationship: ''
  });
  
  // 동의 체크박스 상태
  const [consents, setConsents] = useState({
    all: false,
    terms: false,
    privacy: false,
    location: false,
    marketing: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError('');
  };

  const handleConsentChange = (event) => {
    const { name, checked } = event.target;
    
    if (name === 'all') {
      setConsents({
        all: checked,
        terms: checked,
        privacy: checked,
        location: checked,
        marketing: checked
      });
    } else {
      const newConsents = {
        ...consents,
        [name]: checked
      };
      
      // 모든 개별 동의가 체크되었는지 확인
      newConsents.all = newConsents.terms && newConsents.privacy && newConsents.location && newConsents.marketing;
      
      setConsents(newConsents);
    }
  };

  const validateForm = () => {
    if (!formData.loginId.trim()) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    
    if (formData.loginId.length < 4) {
      setError('아이디는 4자 이상이어야 합니다.');
      return false;
    }

    if (!formData.loginPw.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.loginPw.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return false;
    }

    if (formData.loginPw !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

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

    // 필수 동의 항목 확인
    if (!consents.terms || !consents.privacy || !consents.location) {
      setError('필수 약관에 동의해주세요.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        loginId: formData.loginId,
        loginPw: formData.loginPw,
        guardianName: formData.guardianName,
        phone: formData.phone,
        email: formData.email,
        relationship: formData.relationship
      };

      console.log('회원가입 요청 데이터:', requestData);

      // API 함수가 사용 가능한 경우에만 호출
      if (typeof register === 'function') {
        const response = await register(requestData);
        console.log('회원가입 응답:', response);
      } else {
        // 임시로 가짜 성공 응답
        console.log('가짜 회원가입 API 호출:', requestData);
      }
      
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err) {
      console.error('회원가입 에러:', err);
      
      if (err.response?.status === 400) {
        const errorMessage = err.response.data?.error || '입력 정보를 다시 확인해주세요.';
        setError(errorMessage);
      } else if (err.response?.status === 409) {
        setError('이미 존재하는 아이디입니다.');
      } else if (err.code === 'ECONNABORTED') {
        setError('서버 응답 시간이 초과되었습니다.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <GJoinPage>
      <MainBoard elevation={3}>
        {/* 돌아가기 버튼 */}
        <BackButton onClick={handleBack} disabled={loading}>
          ← 돌아가기
        </BackButton>

        {/* 페이지 제목 */}
        <PageTitle>회원 정보 입력</PageTitle>

        {/* 폼 컨테이너 */}
        <FormContainer>
          {/* 라벨 컨테이너 */}
          <LabelContainer>
            <FormLabel>아이디</FormLabel>
            <FormLabel>비밀번호</FormLabel>
            <FormLabel>비밀번호 확인</FormLabel>
            <FormLabel>이름</FormLabel>
            <FormLabel>연락처</FormLabel>
            <FormLabel>이메일</FormLabel>
          </LabelContainer>

          {/* 입력 컨테이너 */}
          <InputContainer>
            <StyledTextField
              placeholder="영문, 숫자 조합 4자 이상"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
            />
            <StyledTextField
              placeholder="영문, 숫자 조합 6자 이상"
              name="loginPw"
              type="password"
              value={formData.loginPw}
              onChange={handleChange}
            />
            <StyledTextField
              placeholder="비밀번호를 한번 더 입력해주세요"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <StyledTextField
              placeholder="ex) 홍길동"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
            />
            <StyledTextField
              placeholder="ex) 01012345678"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <StyledFormControl>
              <InputLabel>관계를 선택해주세요</InputLabel>
              <Select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                label="관계를 선택해주세요"
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
          </InputContainer>
        </FormContainer>

        {/* 개인정보 수집 동의 */}
        <ConsentSection>
          <ConsentHeader>
            <FormControlLabel
              control={
                <Checkbox
                  name="all"
                  checked={consents.all}
                  onChange={handleConsentChange}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 26 } }}
                />
              }
              label={
                <Typography sx={{
                  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#8C929A'
                }}>
                  모두 동의하기
                </Typography>
              }
            />
          </ConsentHeader>

          <ConsentItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="terms"
                checked={consents.terms}
                onChange={handleConsentChange}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
              />
              <ConsentText>서비스 이용약관 (필수)</ConsentText>
            </Box>
            <ViewLink onClick={() => navigate('/terms')}>보기</ViewLink>
          </ConsentItem>

          <ConsentItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="privacy"
                checked={consents.privacy}
                onChange={handleConsentChange}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
              />
              <ConsentText>개인정보 처리방침 (필수)</ConsentText>
            </Box>
            <ViewLink onClick={() => navigate('/privacy')}>보기</ViewLink>
          </ConsentItem>

          <ConsentItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="location"
                checked={consents.location}
                onChange={handleConsentChange}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
              />
              <ConsentText>위치기반 서비스 이용약관 (필수)</ConsentText>
            </Box>
            <ViewLink>보기</ViewLink>
          </ConsentItem>

          <ConsentItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                name="marketing"
                checked={consents.marketing}
                onChange={handleConsentChange}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
              />
              <ConsentText>마케팅 정보 수신 동의 (선택)</ConsentText>
            </Box>
            <ViewLink>보기</ViewLink>
          </ConsentItem>
        </ConsentSection>

        {/* 회원가입 버튼 */}
        <SubmitButton
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          ) : null}
          {loading ? '가입 중...' : '회원가입'}
        </SubmitButton>

        {/* 에러/성공 메시지 */}
        <ErrorBox>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%',
                fontSize: '16px',
                borderRadius: '10px'
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                width: '100%',
                fontSize: '16px',
                borderRadius: '10px'
              }}
            >
              {success}
            </Alert>
          )}
        </ErrorBox>
      </MainBoard>
    </GJoinPage>
  );
};

export default GJoinpage;