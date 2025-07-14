import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuardianProfile, updateGuardianProfile, logout } from '../api/apiClient';
import PasswordConfirmModal from './PasswordConfirmModal';
import { clearAuthData } from '../utils/auth';

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
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

const ProfileManagement = () => {
  const navigate = useNavigate();
  
  // 렌더링 횟수 추적
  console.log('ProfileManagement 컴포넌트 렌더링 시작');
  
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    guardianName: '',
    phoneNumber: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false); // 초기값 false로 변경
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

  // 컴포넌트 마운트 시 비밀번호 확인 상태 처리
  useEffect(() => {
    console.log('ProfileManagement useEffect 실행');
    
    // sessionStorage에서 비밀번호 확인 상태 확인
    const isPasswordVerified = sessionStorage.getItem('passwordVerified') === 'true';
    console.log('sessionStorage passwordVerified:', isPasswordVerified);
    
    if (isPasswordVerified) {
      console.log('이미 비밀번호 확인 완료됨 - 모달 건너뛰기');
      setIsPasswordConfirmed(true);
      console.log('showPasswordModal 상태 변경: false');
      setShowPasswordModal(false);
    } else {
      console.log('비밀번호 확인 필요 - 모달 표시');
      console.log('showPasswordModal 상태 변경: true');
      setShowPasswordModal(true);
      setIsPasswordConfirmed(false);
    }
    
    setError('');
    setSuccess('');
    
    // 컴포넌트 언마운트 시 비밀번호 확인 상태 초기화
    return () => {
      console.log('ProfileManagement 언마운트 - passwordVerified 초기화');
      sessionStorage.removeItem('passwordVerified');
    };
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 프로필 정보 가져오기
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('프로필 정보 가져오기 시작...');
      
      const response = await getGuardianProfile();
      console.log('프로필 응답 데이터:', response);
      
      setProfile(response.data || response);
      setFormData({
        guardianName: (response.data || response).guardianName || '',
        phoneNumber: (response.data || response).phoneNumber || '',
        email: (response.data || response).email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('프로필 가져오기 오류 상세:', err);
      console.error('에러 응답:', err.response);
      console.error('에러 메시지:', err.message);
      
      if (err.response?.status === 401) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 500) {
        setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else {
        setError(`프로필 정보를 가져오는데 실패했습니다. (오류: ${err.message})`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPasswordConfirmed) {
      fetchProfile();
    }
  }, [fetchProfile, isPasswordConfirmed]);

  // 입력값 변경 핸들러
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 정보 업데이트
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 기본 정보만 업데이트
      const updateData = {
        guardianName: formData.guardianName,
        phoneNumber: formData.phoneNumber,
        email: formData.email
      };

      // 비밀번호 변경이 요청된 경우
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('새 비밀번호가 일치하지 않습니다.');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('새 비밀번호는 6자 이상이어야 합니다.');
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateGuardianProfile(updateData);
      
      setSuccess('정보가 성공적으로 수정되었습니다.');
      
      // 비밀번호 필드 초기화
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // 프로필 정보 다시 가져오기
      await fetchProfile();

    } catch (err) {
      console.error('업데이트 오류:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('정보 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (토큰 비활성화)
      await logout();
      
      // 비밀번호 확인 상태 클리어
      sessionStorage.removeItem('passwordVerified');
      
      // 모든 인증 데이터 클리어
      clearAuthData();
      
      alert('로그아웃 되었습니다.');
      
      // 커스텀 이벤트 발생
      window.dispatchEvent(new Event('authStateChange'));
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 데이터는 삭제
      sessionStorage.removeItem('passwordVerified');
      clearAuthData();
      window.dispatchEvent(new Event('authStateChange'));
      navigate('/');
    }
  };

  // 비밀번호 확인 모달 핸들러
  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    navigate('/home'); // 취소시 홈으로 이동
  };

  const handlePasswordConfirm = () => {
    console.log('비밀번호 확인 성공 - sessionStorage에 상태 저장');
    
    // sessionStorage에 비밀번호 확인 상태 저장
    sessionStorage.setItem('passwordVerified', 'true');
    
    setIsPasswordConfirmed(true);
    setShowPasswordModal(false);
  };

  // 공통 TextField 스타일
  const textFieldSx = {
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
      },
      '&.Mui-disabled': {
        backgroundColor: '#f8f9fa',
        '& fieldset': {
          border: 'none'
        }
      }
    },
    '& .MuiInputBase-input': {
      fontFamily: 'Pretendard',
      fontWeight: 700,
      fontSize: '16px',
      color: '#333',
      padding: '0',
      '&::placeholder': {
        color: '#B4B4B4',
        opacity: 1
      },
      '&.Mui-disabled': {
        color: '#666',
        WebkitTextFillColor: '#666'
      }
    }
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#CCE5FF',
      display: 'flex',
      gap: '0px',
      overflow: 'hidden'
    }}>
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
        elevation: 0
      }}>
        {/* 사용자 정보 영역 - Home.jsx와 동일하게 */}
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
          {/* 사용자 아이콘 */}
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
          
          {/* 사용자 정보 */}
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            {formData.guardianName || '신규보호자'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
            보호자
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
          <ListItem onClick={() => navigate('/home')}>
            <ListItemIcon>
              <DashboardOutlined />
            </ListItemIcon>
            <ListItemText primary="홈" />
          </ListItem>

          <ListItem className="active">
            <ListItemIcon>
              <EditOutlined />
            </ListItemIcon>
            <ListItemText primary="회원정보 관리" />
          </ListItem>

          <ListItem onClick={() => navigate('/seniors')}>
            <ListItemIcon>
              <PeopleOutlined />
            </ListItemIcon>
            <ListItemText primary="보호 대상자" />
          </ListItem>

          <ListItem onClick={() => navigate('/monitoring')}>
            <ListItemIcon>
              <SecurityOutlined />
            </ListItemIcon>
            <ListItemText primary="안전 모니터링" />
          </ListItem>

          <ListItem onClick={() => navigate('/alerts')}>
            <ListItemIcon>
              <NotificationsOutlined />
            </ListItemIcon>
            <ListItemText primary="알림 센터" />
          </ListItem>

          <ListItem onClick={() => navigate('/schedule')}>
            <ListItemIcon>
              <EventOutlined />
            </ListItemIcon>
            <ListItemText primary="일정 관리" />
          </ListItem>

          <ListItem onClick={() => navigate('/messages')}>
            <ListItemIcon>
              <MessageOutlined />
            </ListItemIcon>
            <ListItemText primary="메시지" />
          </ListItem>
        </List>

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
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: '900px',
            backgroundColor: 'transparent',
            padding: '40px',
            position: 'relative'
          }}>
            {loading && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                zIndex: 1000,
                borderRadius: '10px'
              }}>
                <CircularProgress size={50} sx={{ color: '#0869CC' }} />
                <Typography sx={{ 
                  color: '#0869CC', 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  fontFamily: 'Pretendard'
                }}>
                  로딩 중...
                </Typography>
              </Box>
            )}

            {/* 비밀번호 확인이 완료된 경우에만 내용 표시 */}
            {isPasswordConfirmed && (
              <>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '32px',
                  color: '#000000',
                  textAlign: 'center',
                  marginBottom: '40px'
                }}>
                  회원정보 관리
                </Typography>

                {/* 기본 정보 */}
                <Box sx={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  marginBottom: '40px'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC',
                    borderTop: '4px solid #00458B'
                  }}>
                    <Box sx={{
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
                    }}>
                      아이디
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        value={profile.loginId || ''}
                        disabled
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC'
                  }}>
                    <Box sx={{
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
                    }}>
                      이름
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        value={formData.guardianName}
                        onChange={handleInputChange('guardianName')}
                        placeholder="이름을 입력하세요"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC'
                  }}>
                    <Box sx={{
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
                    }}>
                      연락처
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        value={formData.phoneNumber}
                        onChange={handleInputChange('phoneNumber')}
                        placeholder="ex) 010-1234-5678"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC'
                  }}>
                    <Box sx={{
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
                    }}>
                      이메일
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        placeholder="이메일을 입력하세요"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* 비밀번호 변경 섹션 */}
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: '#00458B',
                  textAlign: 'center',
                  marginBottom: '30px',
                  marginTop: '50px'
                }}>
                  🔒 비밀번호 변경 (선택사항)
                </Typography>

                <Box sx={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  marginBottom: '40px'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC',
                    borderTop: '4px solid #00458B'
                  }}>
                    <Box sx={{
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
                    }}>
                      현재 비밀번호
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleInputChange('currentPassword')}
                        placeholder="변경시에만 입력"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC'
                  }}>
                    <Box sx={{
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
                    }}>
                      새 비밀번호
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange('newPassword')}
                        placeholder="6자 이상 입력"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    borderBottom: '1px solid #0869CC'
                  }}>
                    <Box sx={{
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
                    }}>
                      비밀번호 확인
                    </Box>
                    <Box sx={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}>
                      <TextField
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        placeholder="새 비밀번호를 다시 입력"
                        variant="outlined"
                        sx={textFieldSx}
                      />
                    </Box>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleUpdate}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  sx={{
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
                  }}
                >
                  {loading ? '수정 중...' : '정보 수정'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* 고정 에러/성공 메시지 */}
      <Box sx={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '400px',
        maxWidth: '90vw',
        zIndex: 2000,
        '& .MuiAlert-root': {
          borderRadius: '8px',
          fontSize: '16px'
        }
      }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ marginBottom: '10px' }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess('')}
            sx={{ marginBottom: '10px' }}
          >
            {success}
          </Alert>
        )}
      </Box>
      
      {/* 비밀번호 확인 모달 */}
      <PasswordConfirmModal
        open={showPasswordModal}
        onClose={handlePasswordModalClose}
        onConfirm={handlePasswordConfirm}
      />
    </Box>
  );
};

export default ProfileManagement;
