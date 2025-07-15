import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/apiClient';

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
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Backdrop
} from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    loginId: '',
    loginPw: '',
    confirmPw: '',
    guardianName: '',
    phone: '',
    email: ''
  });
  
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    location: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 팝업 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  
  // 약관 내용
  const termsContent = {
    service: {
      title: '서비스 이용약관',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>제1조 (목적)</Typography>
          <Typography paragraph>
            이 약관은 헬스케어 관리 시스템(이하 '회사')이 제공하는 서비스의 이용에 관한 기본적인 사항을 정합니다.
          </Typography>
          
          <Typography variant="h6" gutterBottom>제2조 (서비스 내용)</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">어르신 건강 모니터링 서비스</Typography>
            <Typography component="li">응급 상황 대응 서비스</Typography>
            <Typography component="li">가족 연결 서비스</Typography>
            <Typography component="li">기타 건강관리 관련 서비스</Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>제3조 (이용자의 의무)</Typography>
          <Typography paragraph>
            이용자는 정확한 정보를 제공하고, 서비스를 올바른 목적으로 이용하여야 합니다.
          </Typography>
        </Box>
      )
    },
    privacy: {
      title: '개인정보 처리방침',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>제1조 (개인정보 수집 목적)</Typography>
          <Typography paragraph>회사는 다음의 목적을 위해 개인정보를 수집합니다.</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">서비스 제공 및 운영</Typography>
            <Typography component="li">이용자 식별 및 인증</Typography>
            <Typography component="li">응급 상황 대응</Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>제2조 (수집하는 개인정보 항목)</Typography>
          <Typography paragraph>
            <strong>필수항목:</strong> 아이디, 비밀번호, 이름
          </Typography>
          <Typography paragraph>
            <strong>선택항목:</strong> 연락처, 이메일
          </Typography>
          
          <Typography variant="h6" gutterBottom>제3조 (개인정보 보유 및 이용기간)</Typography>
          <Typography paragraph>
            원칙적으로 서비스 이용기간 동안 보유하며, 탈퇴 시 즉시 파기합니다.
          </Typography>
        </Box>
      )
    },
    location: {
      title: '위치기반 서비스 이용약관',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>제1조 (위치정보 수집 목적)</Typography>
          <Typography paragraph>어르신의 안전한 일상생활을 위해 위치정보를 활용합니다.</Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">응급 상황 시 위치 파악</Typography>
            <Typography component="li">안전구역 설정 및 모니터링</Typography>
            <Typography component="li">이동 경로 및 패턴 분석</Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>제2조 (위치정보 수집 방법)</Typography>
          <Typography paragraph>GPS, WiFi, 비콘 등을 통해 위치정보를 수집합니다.</Typography>
          
          <Typography variant="h6" gutterBottom>제3조 (위치정보 제3자 제공)</Typography>
          <Typography paragraph>응급 상황 시 소방서, 경찰서, 병원 등에 제공될 수 있습니다.</Typography>
        </Box>
      )
    }
  };
  
  const handleViewTerms = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType('');
  };

  const handleAcceptTerms = () => {
    setAgreements(prev => ({
      ...prev,
      [dialogType]: true
    }));
    handleCloseDialog();
  };

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

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleAgreementChange = (field) => (event) => {
    setAgreements(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const validateForm = () => {
    if (!formData.loginId.trim()) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    
    if (formData.loginId.length < 4 || formData.loginId.length > 12) {
      setError('아이디는 4~12자 영문, 숫자 조합이어야 합니다.');
      return false;
    }

    if (!formData.loginPw.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.loginPw.length < 6 || formData.loginPw.length > 12) {
      setError('비밀번호는 6~12자 영문, 숫자 조합이어야 합니다.');
      return false;
    }

    if (formData.loginPw !== formData.confirmPw) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (!formData.guardianName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9-]+$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('연락처는 숫자와 하이픈만 입력 가능합니다.');
        return false;
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return false;
      }
    }

    if (!agreements.service || !agreements.privacy || !agreements.location) {
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
        loginId: formData.loginId.trim(),
        loginPw: formData.loginPw,
        guardianName: formData.guardianName.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        role: 'GUARDIAN'
      };

      const response = await register(requestData);
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 409) {
        setError('이미 존재하는 아이디입니다.');
      } else if (err.response?.status === 400) {
        setError('입력 정보를 다시 확인해주세요.');
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

  // 공통 입력 필드 스타일
  const inputFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      border: 'none',
      '& fieldset': { border: 'none' },
      '&:hover fieldset': { border: 'none' },
      '&.Mui-focused fieldset': { border: 'none' }
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
      }
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, rgba(0, 124, 255, 0.05) 0%, rgba(0, 188, 255, 0.05) 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'auto',
      padding: '20px 0'
    }}>
      <Paper sx={{
        position: 'relative',
        width: '1200px',
        maxWidth: '90vw',
        height: '800px',
        maxHeight: '90vh',
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* 페이지 제목 */}
        <Typography sx={{
          position: 'absolute',
          top: '50px',
          fontFamily: 'Pretendard',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#000000',
          textAlign: 'center'
        }}>
          회원가입
        </Typography>

        {/* 입력 폼 테이블 */}
        <Box sx={{ position: 'absolute', top: '100px', width: '900px', maxWidth: '90%' }}>
          <Table sx={{ 
            '& .MuiTableCell-root': { 
              border: 'none',
              padding: 0
            }
          }}>
            <TableBody>
              {/* 아이디 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    height: '50px', 
                    borderBottom: '1px solid #0869CC', 
                    borderTop: '4px solid #00458B' 
                  }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      아이디
                      <Box component="span" sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Box>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        placeholder="영문, 숫자 조합 4~12자" 
                        value={formData.loginId} 
                        onChange={handleInputChange('loginId')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              {/* 비밀번호 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', height: '50px', borderBottom: '1px solid #0869CC' }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      비밀번호
                      <Box component="span" sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Box>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        type="password" 
                        placeholder="영문, 숫자 조합 6~12자" 
                        value={formData.loginPw}
                        onChange={handleInputChange('loginPw')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              {/* 비밀번호 확인 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', height: '50px', borderBottom: '1px solid #0869CC' }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      비밀번호 확인
                      <Box component="span" sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Box>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        type="password" 
                        placeholder="비밀번호를 다시 입력하세요" 
                        value={formData.confirmPw}
                        onChange={handleInputChange('confirmPw')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              {/* 이름 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', height: '50px', borderBottom: '1px solid #0869CC' }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      이름
                      <Box component="span" sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Box>
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        placeholder="이름을 입력하세요" 
                        value={formData.guardianName}
                        onChange={handleInputChange('guardianName')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              {/* 연락처 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', height: '50px', borderBottom: '1px solid #0869CC' }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      연락처
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        placeholder="010-1234-5678" 
                        value={formData.phone}
                        onChange={handleInputChange('phone')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>

              {/* 이메일 */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', height: '50px', borderBottom: '1px solid #0869CC' }}>
                    <Box sx={{ 
                      width: '180px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(51, 153, 255, 0.3)', 
                      fontFamily: 'Pretendard', 
                      fontWeight: 700, 
                      fontSize: '18px' 
                    }}>
                      이메일
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingX: '24px' 
                    }}>
                      <TextField 
                        placeholder="example@email.com" 
                        value={formData.email}
                        onChange={handleInputChange('email')} 
                        fullWidth 
                        sx={inputFieldStyle} 
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        {/* 약관 동의 */}
        <Box sx={{ 
          position: 'absolute', 
          top: '420px', 
          width: '900px', 
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.service}
                onChange={handleAgreementChange('service')}
                sx={{ color: '#0869CC' }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Pretendard', fontSize: '16px' }}>
                  서비스 이용약관 동의
                </Typography>
                <Typography sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Typography>
                <Link
                  component="button"
                  type="button"
                  onClick={() => handleViewTerms('service')}
                  sx={{ marginLeft: '8px', fontFamily: 'Pretendard' }}
                >
                  [보기]
                </Link>
              </Box>
            }
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.privacy}
                onChange={handleAgreementChange('privacy')}
                sx={{ color: '#0869CC' }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Pretendard', fontSize: '16px' }}>
                  개인정보 처리방침 동의
                </Typography>
                <Typography sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Typography>
                <Link
                  component="button"
                  type="button"
                  onClick={() => handleViewTerms('privacy')}
                  sx={{ marginLeft: '8px', fontFamily: 'Pretendard' }}
                >
                  [보기]
                </Link>
              </Box>
            }
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={agreements.location}
                onChange={handleAgreementChange('location')}
                sx={{ color: '#0869CC' }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Pretendard', fontSize: '16px' }}>
                  위치기반 서비스 이용약관 동의
                </Typography>
                <Typography sx={{ color: '#ff4444', marginLeft: '4px' }}>*</Typography>
                <Link
                  component="button"
                  type="button"
                  onClick={() => handleViewTerms('location')}
                  sx={{ marginLeft: '8px', fontFamily: 'Pretendard' }}
                >
                  [보기]
                </Link>
              </Box>
            }
          />
        </Box>

        {/* 에러/성공 메시지 */}
        {error && (
          <Box sx={{ position: 'absolute', top: '560px', width: '900px', maxWidth: '90%' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        
        {success && (
          <Box sx={{ position: 'absolute', top: '560px', width: '900px', maxWidth: '90%' }}>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}

        {/* 버튼들 */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: '50px', 
          display: 'flex', 
          gap: '20px' 
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{
              width: '120px',
              height: '50px',
              borderColor: '#0869CC',
              color: '#0869CC',
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '16px',
              '&:hover': {
                borderColor: '#0869CC',
                backgroundColor: 'rgba(8, 105, 204, 0.1)'
              }
            }}
          >
            뒤로가기
          </Button>
          
          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
            sx={{
              width: '120px',
              height: '50px',
              backgroundColor: '#0869CC',
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '16px',
              '&:hover': {
                backgroundColor: '#0652A3'
              },
              '&:disabled': {
                backgroundColor: '#cccccc'
              }
            }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </Box>
      </Paper>

      {/* 약관 내용 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Pretendard', fontWeight: 700 }}>
          {dialogType && termsContent[dialogType]?.title}
        </DialogTitle>
        
        <DialogContent>
          {dialogType && termsContent[dialogType]?.content}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ fontFamily: 'Pretendard' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleAcceptTerms}
            variant="contained"
            sx={{ 
              backgroundColor: '#0869CC',
              fontFamily: 'Pretendard',
              '&:hover': {
                backgroundColor: '#0652A3'
              }
            }}
          >
            동의하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 로딩 백드롭 */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.8)'
        }}
        open={loading}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <CircularProgress size={50} sx={{ color: '#0869CC' }} />
          <Typography sx={{ 
            color: '#0869CC', 
            fontSize: '18px', 
            fontWeight: 'bold',
            fontFamily: 'Pretendard'
          }}>
            회원가입 중...
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default Register;