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
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import personAddIcon from '../images/lock_icon.png';
import image3 from '../images/image3.png';

// 로그인과 동일한 스타일
const RegisterPage = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100vh', // minHeight에서 height로 변경
  padding: '20px',
  backgroundColor: '#01b1ff',
  overflow: 'hidden' // 스크롤 방지
});

const RegisterContent = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  width: '100%'
});

const RegisterContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: '30px',
  padding: '60px',
  gap: '60px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '1200px',
  width: '90%', // 100%에서 90%로 변경
  [theme.breakpoints.down('lg')]: {
    padding: '40px',
    gap: '40px',
    maxWidth: '1000px'
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: '30px 20px',
    gap: '30px',
    maxWidth: '600px'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 15px',
    maxWidth: '95%',
    borderRadius: '20px'
  }
}));

const RegisterImage = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${image3})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '20px',
  width: '400px',
  height: '600px',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    width: '350px',
    height: '500px'
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '450px', // RegisterBox와 비슷하게
    height: '320px' // 높이 증가
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '400px',
    height: '280px'
  }
}));

const RegisterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '450px',
  flexDirection: 'column',
  gap: '20px',
  backgroundColor: 'transparent',
  [theme.breakpoints.down('lg')]: {
    width: '400px'
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '450px'
  }
}));

const RegisterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '15px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    gap: '10px'
  }
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  backgroundColor: '#00458B',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
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

const RegisterTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"NanumHuman OTF", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 600,
  fontSize: '48px',
  lineHeight: 1.2,
  color: '#00458B',
  margin: 0,
  [theme.breakpoints.down('md')]: {
    fontSize: '36px'
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '28px'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '55px',
    backgroundColor: '#FFFFFF',
    borderRadius: '15px',
    '& fieldset': {
      borderColor: '#00BCFF',
      borderWidth: '2px'
    },
    '&:hover fieldset': {
      borderColor: '#00BCFF'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007CFF',
      boxShadow: '0 0 6px rgba(0, 124, 255, 0.3)'
    }
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    color: '#333',
    padding: '0 15px'
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiOutlinedInput-root': {
      height: '50px'
    }
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '55px',
    backgroundColor: '#FFFFFF',
    borderRadius: '15px',
    '& fieldset': {
      borderColor: '#00BCFF',
      borderWidth: '2px'
    },
    '&:hover fieldset': {
      borderColor: '#00BCFF'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007CFF',
      boxShadow: '0 0 6px rgba(0, 124, 255, 0.3)'
    }
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    color: '#333'
  }
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  height: '60px',
  backgroundColor: '#3399FF',
  borderRadius: '15px',
  fontSize: '18px',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover:not(:disabled)': {
    backgroundColor: '#2288EE',
    boxShadow: '0 5px 15px rgba(51, 153, 255, 0.4)'
  },
  '&:disabled': {
    opacity: 0.7,
    backgroundColor: '#3399FF'
  },
  [theme.breakpoints.down('md')]: {
    height: '55px'
  }
}));

const BackButton = styled(Button)(({ theme }) => ({
  height: '60px',
  backgroundColor: '#666',
  borderRadius: '15px',
  fontSize: '18px',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#555',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(102, 102, 102, 0.4)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  [theme.breakpoints.down('md')]: {
    height: '55px'
  }
}));

const ErrorBox = styled(Box)({
  display: 'flex',
  textAlign: 'center',
  justifyContent: 'center',
  minHeight: '50px',
  alignItems: 'center',
  flexDirection: 'column',
  margin: '10px 0'
});

// 푸터 스타일 컴포넌트 추가
const Footer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px 15px 0 0',
  marginTop: '20px',
  boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: '15px'
  }
}));

const FooterLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    gap: '15px',
    flexDirection: 'column',
    alignItems: 'center'
  }
}));

const FooterLink = styled(Link)({
  color: '#00458B',
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#007CFF',
    textDecoration: 'underline'
  }
});

const CopyrightText = styled(Typography)({
  color: '#666',
  fontSize: '12px',
  textAlign: 'center'
});

const Register = () => {
  const navigate = useNavigate();
  
  // 페이지 진입시 스크롤 방지
  useEffect(() => {
    // 스크롤 방지 (강력하게)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    // 컴포넌트 언마운트시 스크롤 복원
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);
  
  // ✅ 백엔드 RegisterRequestDto와 정확히 일치하는 필드들
  const [formData, setFormData] = useState({
    loginId: '',          // 로그인 ID
    loginPw: '',          // 비밀번호
    confirmPassword: '',  // 비밀번호 확인 (프론트엔드 검증용)
    guardianName: '',     // 보호자 이름
    phone: '',            // 전화번호
    email: '',            // 이메일
    relationship: ''      // 관계 (아버지, 어머니, 자녀 등)
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError(''); // 입력시 에러 메시지 초기화
  };

  const validateForm = () => {
    // 필수 필드 체크
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

    // 전화번호 형식 체크
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('전화번호는 숫자와 하이픈만 입력 가능합니다.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (!formData.relationship.trim()) {
      setError('관계를 선택해주세요.');
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
      // ✅ 백엔드 RegisterRequestDto와 정확히 일치하는 데이터 전송
      const requestData = {
        loginId: formData.loginId,
        loginPw: formData.loginPw,
        guardianName: formData.guardianName,
        phone: formData.phone,
        email: formData.email,
        relationship: formData.relationship
        // role은 백엔드에서 자동으로 GUARDIAN으로 설정됨
      };

      console.log('회원가입 요청 데이터:', requestData);

      const response = await axios.post(
        'http://localhost:8080/api/auth/register',
        requestData,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      console.log('회원가입 응답:', response.data);
      
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
    <RegisterPage>
      <RegisterContent>
        <RegisterContainer elevation={0}>
          {/* 왼쪽 배경 이미지 영역 */}
          <RegisterImage />

          <RegisterBox>
            {/* 아이콘 + 회원가입 텍스트 */}
            <RegisterHeader>
              <IconBox>
                <img src={personAddIcon} alt="register" />
              </IconBox>
              <RegisterTitle>회원가입</RegisterTitle>
            </RegisterHeader>

            {/* 아이디 입력 */}
            <StyledTextField
              variant="outlined"
              placeholder="아이디 (4자 이상)"
              name="loginId"
              fullWidth
              value={formData.loginId}
              onChange={handleChange}
            />

            {/* 비밀번호 입력 */}
            <StyledTextField
              variant="outlined"
              placeholder="비밀번호 (6자 이상)"
              name="loginPw"
              type="password"
              fullWidth
              value={formData.loginPw}
              onChange={handleChange}
            />

            {/* 비밀번호 확인 */}
            <StyledTextField
              variant="outlined"
              placeholder="비밀번호 확인"
              name="confirmPassword"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* 이름 입력 */}
            <StyledTextField
              variant="outlined"
              placeholder="이름"
              name="guardianName"
              fullWidth
              value={formData.guardianName}
              onChange={handleChange}
            />

            {/* 전화번호 입력 */}
            <StyledTextField
              variant="outlined"
              placeholder="전화번호 (예: 010-1234-5678)"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />

            {/* 이메일 입력 */}
            <StyledTextField
              variant="outlined"
              placeholder="이메일"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />

            {/* ✅ 관계 선택 (새로 추가) */}
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

            {/* 회원가입 버튼 */}
            <RegisterButton
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '가입 중...' : '회원가입'}
            </RegisterButton>

            {/* 돌아가기 버튼 */}
            <BackButton
              variant="contained"
              fullWidth
              onClick={handleBack}
              disabled={loading}
            >
              로그인으로 돌아가기
            </BackButton>

            {/* 메시지 표시 */}
            <ErrorBox>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%',
                    fontSize: '14px',
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
                    fontSize: '14px',
                    borderRadius: '10px'
                  }}
                >
                  {success}
                </Alert>
              )}
            </ErrorBox>
          </RegisterBox>
        </RegisterContainer>
      </RegisterContent>

      {/* 푸터 추가 */}
      <Footer>
        <FooterLinks>
          <FooterLink href="/terms">
            이용약관
          </FooterLink>
          <FooterLink href="/privacy">
            개인정보처리방침
          </FooterLink>
          <FooterLink href="/support">
            고객센터
          </FooterLink>
          <FooterLink href="/about">
            서비스 소개
          </FooterLink>
        </FooterLinks>
        <CopyrightText>
          © 2025 Healthcare Management System. All rights reserved.
        </CopyrightText>
      </Footer>
    </RegisterPage>
  );
};

export default Register;