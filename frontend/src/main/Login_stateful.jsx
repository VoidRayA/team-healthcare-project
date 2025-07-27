import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import lockicon from '../images/lock_icon.png';
import image3 from '../images/image3.png';
import { login } from '../api/apiClient';
import { saveAuthData } from '../utils/auth';

// 스타일드 컴포넌트들 (기존과 동일)
const LoginPage = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#01b1ff'
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
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    padding: '40px',
    gap: '40px'
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: '30px 20px',
    gap: '30px'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 15px'
  }
}));

const LoginImage = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${image3})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '20px',
  width: '400px',
  height: '500px',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    width: '350px',
    height: '450px'
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: '350px',
    height: '250px'
  }
}));

const LoginBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '400px',
  flexDirection: 'column',
  gap: '20px',
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
  height: '70px',
  alignItems: 'center',
  flexDirection: 'column',
  margin: '10px 0'
});

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ loginId: '', loginPw: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async () => {
    // 입력값 유효성 검사
    if (!user.loginId.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    
    if (!user.loginPw.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 실제 백엔드 API 호출
      const response = await login(user);
      
      // Stateful JWT 처리
      const { accessToken, refreshToken, loginId, guardianName, role } = response;
      
      if (accessToken && refreshToken) {
        // 토큰 및 사용자 정보 저장
        saveAuthData(accessToken, refreshToken, {
          loginId,
          guardianName,
          role
        });
        
        alert(`로그인 성공! ${guardianName}님 환영합니다.`);
        
        // 로그인 후 리다이렉트 처리
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/home');
        }
      } else {
        setError('로그인 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      
      if (err.response?.status === 401) {
        setError('아이디 또는 비밀번호가 잘못되었습니다.');
      } else if (err.response?.status === 404) {
        setError('존재하지 않는 계정입니다.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    navigate('/register');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <LoginPage>
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
            name="loginId"
            fullWidth
            value={user.loginId}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />

          {/* 비밀번호 입력 박스 */}
          <StyledTextField
            variant="outlined"
            placeholder="비밀번호를 입력하세요"
            name="loginPw"
            type="password"
            fullWidth
            value={user.loginPw}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
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

          {/* 오류 메시지 */}
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
    </LoginPage>
  );
};

export default Login;
