import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // CSS 파일 import
// API 클라이언트 import로 axios 대체 (2025.07.08)
import { login } from '../api/apiClient';
import { saveAuthData } from '../utils/auth';

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
import lockicon from '../images/lock_icon.png';
import image3 from '../images/image3.png';

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
      // 실제 백엔드 API 호출 (apiClient 사용)
      const response = await login({
        loginId: user.userid,
        loginPw: user.password
      });

      console.log('로그인 응답:', response);

      // 응답에서 데이터 추출 (AuthResponseDto 구조와 일치)
      const { 
        accessToken, 
        refreshToken, 
        tokenType, 
        expiresIn, 
        loginId, 
        guardianName, 
        role,
        senior 
      } = response;
      
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
        
        // auth 유틸리티를 사용하여 저장
        // saveAuthData는 3개의 매개변수를 받음: accessToken, refreshToken, userData
        saveAuthData(
          accessToken, 
          refreshToken || '', 
          {
            loginId: loginId || user.userid,
            guardianName: guardianName || '',
            role: role || 'GUARDIAN'
          }
        );

        console.log('로그인 성공, 저장된 데이터:', {
          jwt: accessToken,
          refreshToken: refreshToken,
          loginId,
          guardianName,
          role,
          expiresIn,
          senior: senior
        });

        alert(`로그인 성공! ${guardianName || '사용자'}님 환영합니다.`);
        
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
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '100vh',
      padding: '20px',
      backgroundColor: '#01b1ff',
      overflow: 'hidden'
    }}>
      {/* 로그인 컨텐츠 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%'
      }}>
        {/* 로그인 컨테이너 */}
        <Paper sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '60px',
          gap: '60px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '1000px',
          width: '90%',
          // 반응형 디자인
          '@media (max-width: 1200px)': {
            padding: '40px',
            gap: '40px',
            maxWidth: '900px'
          },
          '@media (max-width: 900px)': {
            flexDirection: 'column',
            padding: '30px 20px',
            gap: '30px',
            maxWidth: '600px'
          },
          '@media (max-width: 600px)': {
            padding: '20px 15px',
            maxWidth: '95%',
            borderRadius: '20px'
          }
        }}>
          {/* 왼쪽 배경 이미지 영역 */}
          <Box sx={{
            backgroundImage: `url(${image3})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '500px',
            height: '550px',
            flexShrink: 0,
            // 반응형 디자인
            '@media (max-width: 1200px)': {
              width: '350px',
              height: '450px'
            },
            '@media (max-width: 900px)': {
              width: '100%',
              maxWidth: '400px',
              height: '300px'
            },
            '@media (max-width: 600px)': {
              width: '100%',
              maxWidth: '350px',
              height: '250px'
            }
          }} />

          {/* 로그인 폼 박스 */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '400px',
            flexDirection: 'column',
            gap: '15px',
            backgroundColor: 'transparent',
            // 반응형 디자인
            '@media (max-width: 1200px)': {
              width: '350px'
            },
            '@media (max-width: 900px)': {
              width: '100%',
              maxWidth: '400px'
            }
          }}>
            {/* 자물쇠 아이콘 + 로그인 텍스트 */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              gap: '15px',
              marginBottom: '20px',
              '@media (max-width: 600px)': {
                gap: '10px'
              }
            }}>
              {/* 자물쇠 아이콘 */}
              <Box sx={{
                width: '50px',
                height: '50px',
                backgroundColor: '#00458B',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '@media (max-width: 600px)': {
                  width: '40px',
                  height: '40px'
                }
              }}>
                <Box
                  component="img"
                  src={lockicon}
                  alt="lock"
                  sx={{
                    width: '30px',
                    height: '30px',
                    filter: 'brightness(0) invert(1)',
                    '@media (max-width: 600px)': {
                      width: '24px',
                      height: '24px'
                    }
                  }}
                />
              </Box>

              {/* 로그인 제목 */}
              <Typography sx={{
                fontFamily: '"NanumHuman OTF", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 600,
                fontSize: '48px',
                lineHeight: 1.2,
                color: '#00458B',
                margin: 0,
                '@media (max-width: 900px)': {
                  fontSize: '36px'
                },
                '@media (max-width: 600px)': {
                  fontSize: '28px'
                }
              }}>
                로그인
              </Typography>
            </Box>

            {/* 아이디 입력 박스 */}
            <TextField
              variant="outlined"
              placeholder="아이디를 입력하세요"
              name="userid"
              fullWidth
              value={user.userid}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              sx={{
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
                '@media (max-width: 900px)': {
                  '& .MuiOutlinedInput-root': {
                    height: '60px'
                  }
                }
              }}
            />

            {/* 비밀번호 입력 박스 */}
            <TextField
              variant="outlined"
              placeholder="비밀번호를 입력하세요"
              name="password"
              type="password"
              fullWidth
              value={user.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              sx={{
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
                '@media (max-width: 900px)': {
                  '& .MuiOutlinedInput-root': {
                    height: '60px'
                  }
                }
              }}
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
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              sx={{
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
                '@media (max-width: 900px)': {
                  height: '60px'
                }
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            {/* 회원가입 버튼 */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleJoin}
              sx={{
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
                '@media (max-width: 900px)': {
                  height: '60px'
                }
              }}
            >
              회원가입
            </Button>

            {/* 오류 메시지 - 공간은 항상 확보, 내용은 조건부 표시 */}
            <Box sx={{
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'center',
              height: '70px',
              alignItems: 'center',
              flexDirection: 'column',
              margin: '10px 0'
            }}>
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
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* 푸터 */}
      <Box sx={{
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
        '@media (max-width: 600px)': {
          padding: '15px'
        }
      }}>
        {/* 푸터 링크들 */}
        <Box sx={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          '@media (max-width: 600px)': {
            gap: '15px',
            flexDirection: 'column',
            alignItems: 'center'
          }
        }}>
          <Link href="/terms" sx={{
            color: '#00458B',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#007CFF',
              textDecoration: 'underline'
            }
          }}>
            이용약관
          </Link>
          <Link href="/privacy" sx={{
            color: '#00458B',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#007CFF',
              textDecoration: 'underline'
            }
          }}>
            개인정보처리방침
          </Link>
          <Link href="/support" sx={{
            color: '#00458B',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#007CFF',
              textDecoration: 'underline'
            }
          }}>
            고객센터
          </Link>
          <Link href="/about" sx={{
            color: '#00458B',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: '#007CFF',
              textDecoration: 'underline'
            }
          }}>
            서비스 소개
          </Link>
        </Box>

        {/* 저작권 텍스트 */}
        <Typography sx={{
          color: '#666',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          © 2025 Healthcare Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;