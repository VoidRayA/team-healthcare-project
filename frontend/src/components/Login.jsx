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
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import lockicon from '../images/lock_icon.png';
import image3 from '../images/image3.png';

// 스타일드 컴포넌트들
const LoginPage = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100vh', // minHeight에서 height로 변경
  padding: '20px',
  backgroundColor: '#01b1ff',
  overflow: 'hidden' // 스크롤 방지
});

const LoginContent = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  width: '100%'
});

const LoginContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: '30px',
  padding: '60px',
  gap: '60px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '1000px',
  width: '90%', // 100%에서 90%로 변경
  [theme.breakpoints.down('lg')]: {
    padding: '40px',
    gap: '40px',
    maxWidth: '900px'
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

const LoginImage = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${image3})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',  
  width: '500px',
  height: '550px',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    width: '350px',
    height: '450px'
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '400px', // LoginBox와 비슷하게
    height: '300px' // 높이 증가
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '350px', // LoginBox sm 설정과 비슷하게
    height: '250px' // 높이 증가
  }
}));

const LoginBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '400px',
  flexDirection: 'column',
  gap: '15px',
  backgroundColor: 'transparent',
  [theme.breakpoints.down('lg')]: {
    width: '350px'
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '400px'
  }
}));

const LoginHeader = styled(Box)(({ theme }) => ({
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

const LockIconBox = styled(Box)(({ theme }) => ({
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

const LoginTitle = styled(Typography)(({ theme }) => ({
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
    height: '65px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    '& fieldset': {
      borderColor: '#00BCFF',
      borderWidth: '3px'
    },
    '&:hover fieldset': {
      borderColor: '#00BCFF'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007CFF',
      boxShadow: '0 0 8px rgba(0, 124, 255, 0.3)'
    }
  },
  '& .MuiInputBase-input': {
    fontSize: '18px',
    color: '#333',
    padding: '0 20px'
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiOutlinedInput-root': {
      height: '60px'
    }
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  height: '70px',
  backgroundColor: '#3399FF',
  borderRadius: '20px',
  fontSize: '20px',
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
    height: '60px'
  }
}));

const JoinButton = styled(Button)(({ theme }) => ({
  height: '70px',
  backgroundColor: '#00458B',
  borderRadius: '20px',
  fontSize: '20px',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#003472',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 69, 139, 0.4)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  [theme.breakpoints.down('md')]: {
    height: '60px'
  }
}));

const ErrorBox = styled(Box)({
  display: 'flex',
  textAlign: 'center',
  justifyContent: 'center',
  height: '70px', // 고정 높이 설정
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

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ userid: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 컴포넌트 마운트시 저장된 아이디/비밀번호 로드
  useEffect(() => {
    // 페이지 진입시 스크롤 방지 (강력하게)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    const savedUserId = localStorage.getItem('savedUserId');
    const savedPassword = localStorage.getItem('savedPassword');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (isRemembered && savedUserId) {
      setUser({
        userid: savedUserId,
        password: savedPassword || ''
      });
      setRememberMe(true);
    }

    // 컴포넌트 언마운트시 스크롤 복원
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);

  const handleChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async () => {
    // 입력값 유효성 검사
    if (!user.userid.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    
    if (!user.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      // 실제 백엔드 API 호출
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        {
          loginId: user.userid,
          loginPw: user.password
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5초 타임아웃
        }
      );

      console.log('로그인 응답:', response.data);

      // 응답에서 데이터 추출
      const { accessToken, loginId, guardianName, role } = response.data;
      
      if (accessToken) {
        // rememberMe 처리
        if (rememberMe) {
          localStorage.setItem('savedUserId', user.userid);
          localStorage.setItem('savedPassword', user.password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedUserId');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('rememberMe');
        }
        
        // localStorage에 저장
        localStorage.setItem('jwt', accessToken);
        localStorage.setItem('loginId', loginId);
        localStorage.setItem('guardianName', guardianName);
        localStorage.setItem('role', role);

        console.log('로그인 성공, 저장된 데이터:', {
          jwt: accessToken,
          loginId,
          guardianName,
          role
        });

        alert(`로그인 성공! ${guardianName}님 환영합니다.`);
        
        // App.jsx에서 인증 상태 감지하여 자동으로 Home으로 리다이렉트
        window.location.reload();
      } else {
        setError('로그인 응답에 토큰이 없습니다.');
      }
      
    } catch (err) {
      console.error('로그인 에러:', err);
      
      if (err.response?.status === 401) {
        setError('아이디 또는 비밀번호가 틀렸습니다.');
      } else if (err.response?.status === 404) {
        setError('존재하지 않는 계정입니다.');
      } else if (err.code === 'ECONNABORTED') {
        setError('서버 응답 시간이 초과되었습니다.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleJoin = () => {
    // 회원가입 페이지로 이동
    navigate('/register');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <LoginPage>
      <LoginContent>
        <LoginContainer elevation={0}>
          {/* 왼쪽 배경 이미지 영역 */}
          <LoginImage />

          <LoginBox>
            {/* 자물쇠 아이콘 + 로그인 텍스트 */}
            <LoginHeader>
              <LockIconBox>
                <img src={lockicon} alt="lock" />
              </LockIconBox>
              <LoginTitle>로그인</LoginTitle>
            </LoginHeader>

            {/* 아이디 입력 박스 */}
            <StyledTextField
              variant="outlined"
              placeholder="아이디를 입력하세요"
              name="userid"
              fullWidth
              value={user.userid}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />

            {/* 비밀번호 입력 박스 */}
            <StyledTextField
              variant="outlined"
              placeholder="비밀번호를 입력하세요"
              name="password"
              type="password"
              fullWidth
              value={user.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />

            {/* 아이디/비밀번호 저장 체크박스 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  sx={{
                    color: '#00BCFF',
                    '&.Mui-checked': {
                      color: '#007CFF',
                    },
                  }}
                />
              }
              label="아이디/비밀번호 저장"
              sx={{
                color: '#666',
                fontSize: '14px',
                '& .MuiFormControlLabel-label': {
                  fontSize: '14px'
                }
              }}
            />

            {/* 로그인 버튼 */}
            <LoginButton
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? '로그인 중...' : '로그인'}
            </LoginButton>

            {/* 회원가입 버튼 */}
            <JoinButton
              variant="contained"
              fullWidth
              onClick={handleJoin}
            >
              회원가입
            </JoinButton>

            {/* 오류 메시지 - 공간은 항상 확보, 내용은 조건부 표시 */}
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
            </ErrorBox>
          </LoginBox>
        </LoginContainer>
      </LoginContent>

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
    </LoginPage>
  );
};

export default Login;