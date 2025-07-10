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
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ProfileManagement.jsx와 동일한 페이지 컨테이너
const PageContainer = styled(Box)({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(180deg, rgba(0, 124, 255, 0.05) 0%, rgba(0, 188, 255, 0.05) 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  padding: '20px 0'
});

// ProfileManagement.jsx와 동일한 메인 보드 (크기 최적화)
const MainBoard = styled(Paper)({
  position: 'relative',
  width: '1200px', // 1820px에서 1200px로 축소
  maxWidth: '90vw',
  height: '800px', // 1000px에서 800px로 축소
  maxHeight: '90vh',
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

// ProfileManagement.jsx와 동일한 페이지 제목 (크기 최적화)
const PageTitle = styled(Typography)({
  position: 'absolute',
  top: '50px', // 80px에서 50px로 조정
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '28px', // 32px에서 28px로 축소
  lineHeight: '34px', // 38px에서 34px로 축소
  color: '#000000',
  textAlign: 'center'
});

// ProfileManagement.jsx와 동일한 입력 폼 컨테이너 (크기 최적화)
const FormContainer = styled(Box)({
  position: 'absolute',
  top: '100px', // 140px에서 100px로 조정
  width: '900px', // 1000px에서 900px로 축소
  maxWidth: '90%',
  height: 'auto'
});

// ProfileManagement.jsx와 동일한 입력 테이블
const InputTable = styled(Box)({
  position: 'relative',
  width: '100%',
  backgroundColor: '#ffffff',
  border: 'none'
});

// ProfileManagement.jsx와 동일한 입력 행 (크기 최적화)
const InputRow = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '50px', // 55px에서 50px로 축소
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #0869CC',
  '&:first-of-type': {
    borderTop: '4px solid #00458B'
  }
});

// ProfileManagement.jsx와 동일한 라벨 섹션 (크기 최적화)
const LabelSection = styled(Box)({
  position: 'absolute',
  left: '0px',
  width: '180px', // 200px에서 180px로 축소
  height: '100%',
  backgroundColor: 'rgba(51, 153, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '18px', // 22px에서 18px로 축소
  color: '#000000'
});

// ProfileManagement.jsx와 동일한 입력 섹션 (위치 조정)
const InputSection = styled(Box)({
  position: 'absolute',
  left: '180px', // 200px에서 180px로 조정
  right: '0px',
  height: '100%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '24px',
  paddingRight: '24px'
});

// ProfileManagement.jsx와 동일한 텍스트 필드 (크기 최적화)
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
    fontWeight: 700,
    fontSize: '16px', // 18px에서 16px로 축소
    color: '#333',
    padding: '0',
    '&::placeholder': {
      color: '#B4B4B4',
      opacity: 1
    }
  }
});

// 동의 섹션 컨테이너 (크기 최적화)
const AgreementContainer = styled(Box)({
  position: 'absolute',
  top: '430px', // 500px에서 430px로 조정
  width: '900px', // 1000px에서 900px로 축소
  maxWidth: '90%',
  height: '160px' // 높이 명시
});

// 동의 섹션 제목 (크기 조정)
const AgreementTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px', // 24px에서 20px로 축소
  color: '#00458B',
  textAlign: 'center',
  marginBottom: '20px' // 30px에서 20px로 축소
});

// 개별 동의 항목 (크기 최적화)
const AgreementItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  height: '28px', // 40px에서 28px로 축소
  marginBottom: '8px', // 16px에서 8px로 축소
  paddingLeft: '4px' // 정렬 개선
});

const AgreementLabel = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 600,
  fontSize: '16px', // 크기 유지
  color: '#000000',
  marginLeft: '8px'
});

// 버튼 컨테이너 (크기 최적화)
const ButtonContainer = styled(Box)({
  position: 'absolute',
  bottom: '50px', // 60px에서 50px로 조정
  left: '50%',
  transform: 'translateX(-50%)',
  width: '460px', // 420px에서 460px로 확대
  height: '65px',
  display: 'flex',
  gap: '20px'
});

// 회원가입 버튼 (크기 최적화)
const RegisterButton = styled(Button)({
  width: '220px', // 200px에서 220px로 확대
  height: '65px',
  backgroundColor: '#0869CC',
  borderRadius: '30px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px', // 24px에서 20px로 축소
  color: '#FFFFFF',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#0653A3'
  },
  '&:disabled': {
    backgroundColor: '#ccc'
  }
});

// 로그인으로 돌아가기 버튼 (크기 최적화)
const BackButton = styled(Button)({
  width: '220px', // 200px에서 220px로 확대
  height: '65px',
  backgroundColor: '#666',
  borderRadius: '30px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '20px', // 20px 유지
  color: '#FFFFFF',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#555'
  }
});

// 에러 컨테이너 (위치 최적화)
const ErrorContainer = styled(Box)({
  position: 'absolute',
  top: '620px', // 680px에서 620px로 조정
  width: '900px', // 1000px에서 900px로 축소
  maxWidth: '90%',
  minHeight: '50px'
});

// 필수 표시 스타일
const RequiredMark = styled('span')({
  color: '#ff4444',
  fontWeight: 'bold',
  marginLeft: '4px'
});

// 팝업 스타일
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '80vh',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
  }
});

const DialogTitleStyled = styled(DialogTitle)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '22px',
  color: '#00458B',
  textAlign: 'center',
  borderBottom: '2px solid #e8f4fd',
  backgroundColor: '#f8fbff',
  padding: '24px'
});

const DialogContentStyled = styled(DialogContent)({
  fontFamily: 'Pretendard',
  fontSize: '15px',
  lineHeight: 1.8,
  color: '#333',
  padding: '32px 28px',
  backgroundColor: '#ffffff'
});

const LoadingOverlay = styled(Box)({
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
});

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
  const [dialogType, setDialogType] = useState(''); // 'service', 'privacy', 'location', 'marketing'
  
  // 약관 내용
  const termsContent = {
    service: {
      title: '서비스 이용약관',
      content: `제1조 (목적)
이 약관은 헬스케어 관리 시스템(이하 '회사')이 제공하는 서비스의 이용에 관한 기본적인 사항을 정합니다.

제2조 (서비스 내용)
1. 어르신 건강 모니터링 서비스
2. 응급 상황 대응 서비스
3. 가족 연결 서비스
4. 기타 건강관리 관련 서비스

제3조 (이용자의 의무)
이용자는 정확한 정보를 제공하고, 서비스를 올바른 목적으로 이용하여야 합니다.`
    },
    privacy: {
      title: '개인정보 처리방침',
      content: `제1조 (개인정보 수집 목적)
회사는 다음의 목적을 위해 개인정보를 수집합니다.
1. 서비스 제공 및 운영
2. 이용자 식별 및 인증
3. 응급 상황 대응

제2조 (수집하는 개인정보 항목)
필수항목: 아이디, 비밀번호, 이름
선택항목: 연락처, 이메일

제3조 (개인정보 보유 및 이용기간)
원칙적으로 서비스 이용기간 동안 보유하며, 탈퇴 시 즉시 파기합니다.`
    },
    location: {
      title: '위치기반 서비스 이용약관',
      content: `제1조 (위치정보 수집 목적)
어르신의 안전한 일상생활을 위해 위치정보를 활용합니다.
1. 응급 상황 시 위치 파악
2. 안전구역 설정 및 모니터링
3. 이동 경로 및 패턴 분석

제2조 (위치정보 수집 방법)
GPS, WiFi, 비콘 등을 통해 위치정보를 수집합니다.

제3조 (위치정보 제3자 제공)
응급 상황 시 소방서, 경찰서, 병원 등에 제공될 수 있습니다.`
    }
  };

  // 약관 내용을 HTML 형태로 렌더링
  const renderTermsContent = (type) => {
    const content = termsContent[type];
    if (!content) return null;
    
    if (type === 'service') {
      return (
        <div>
          <h4>제1조 (목적)</h4>
          <p>이 약관은 헬스케어 관리 시스템(이하 '회사')이 제공하는 서비스의 이용에 관한 기본적인 사항을 정합니다.</p>
          
          <h4>제2조 (서비스 내용)</h4>
          <ul>
            <li>어르신 건강 모니터링 서비스</li>
            <li>응급 상황 대응 서비스</li>
            <li>가족 연결 서비스</li>
            <li>기타 건강관리 관련 서비스</li>
          </ul>
          
          <h4>제3조 (이용자의 의무)</h4>
          <p>이용자는 정확한 정보를 제공하고, 서비스를 올바른 목적으로 이용하여야 합니다.</p>
        </div>
      );
    }
    
    if (type === 'privacy') {
      return (
        <div>
          <h4>제1조 (개인정보 수집 목적)</h4>
          <p>회사는 다음의 목적을 위해 개인정보를 수집합니다.</p>
          <ul>
            <li>서비스 제공 및 운영</li>
            <li>이용자 식별 및 인증</li>
            <li>응급 상황 대응</li>
          </ul>
          
          <h4>제2조 (수집하는 개인정보 항목)</h4>
          <p><strong>필수항목:</strong> 아이디, 비밀번호, 이름</p>
          <p><strong>선택항목:</strong> 연락처, 이메일</p>
          
          <h4>제3조 (개인정보 보유 및 이용기간)</h4>
          <p>원칙적으로 서비스 이용기간 동안 보유하며, 탈퇴 시 즉시 파기합니다.</p>
        </div>
      );
    }
    
    if (type === 'location') {
      return (
        <div>
          <h4>제1조 (위치정보 수집 목적)</h4>
          <p>어르신의 안전한 일상생활을 위해 위치정보를 활용합니다.</p>
          <ul>
            <li>응급 상황 시 위치 파악</li>
            <li>안전구역 설정 및 모니터링</li>
            <li>이동 경로 및 패턴 분석</li>
          </ul>
          
          <h4>제2조 (위치정보 수집 방법)</h4>
          <p>GPS, WiFi, 비콘 등을 통해 위치정보를 수집합니다.</p>
          
          <h4>제3조 (위치정보 제3자 제공)</h4>
          <p>응급 상황 시 소방서, 경찰서, 병원 등에 제공될 수 있습니다.</p>
        </div>
      );
    }
    
    return <div>{content?.content}</div>;
  };
  
  // 팝업 열기 함수
  const handleViewTerms = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  // 팝업 닫기 함수
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType('');
  };

  // 확인 했을 때 동의도 하기
  const handleAcceptTerms = () => {
    setAgreements(prev => ({
      ...prev,
      [dialogType]: true
    }));
    handleCloseDialog();
  };

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

  // 입력값 변경 핸들러
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // 입력 변경시 에러/성공 메시지 클리어
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 동의 체크박스 핸들러
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

    // 연락처는 선택사항이지만, 입력된 경우 유효성 검사
    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9-]+$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('연락처는 숫자와 하이픈만 입력 가능합니다.');
        return false;
      }
    }

    // 이메일도 선택사항이지만, 입력된 경우 유효성 검사
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
        phone: formData.phone.trim() || null, // 빈 문자열이면 null로 전송
        email: formData.email.trim() || null, // 빈 문자열이면 null로 전송
        role: 'GUARDIAN'
      };

      console.log('회원가입 요청 데이터:', requestData);

      const response = await register(requestData);
      console.log('회원가입 성공:', response);

      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      console.error('회원가입 오류:', err);
      
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

  return (
    <PageContainer>
      <MainBoard>
        {loading && (
          <LoadingOverlay>
            <CircularProgress size={50} sx={{ color: '#0869CC' }} />
            <Typography sx={{ 
              color: '#0869CC', 
              fontSize: '18px', 
              fontWeight: 'bold',
              fontFamily: 'Pretendard'
            }}>
              회원가입 중...
            </Typography>
          </LoadingOverlay>
        )}

        {/* 페이지 제목 */}
        <PageTitle>
          회원가입
        </PageTitle>

        {/* 입력 폼 */}
        <FormContainer>
          <InputTable>
            {/* 아이디 */}
            <InputRow>
              <LabelSection>아이디<RequiredMark>*</RequiredMark></LabelSection>
              <InputSection>
                <StyledTextField
                  placeholder="영문, 숫자 조합 4~12자"
                  value={formData.loginId}
                  onChange={handleInputChange('loginId')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>

            {/* 비밀번호 */}
            <InputRow>
              <LabelSection>비밀번호<RequiredMark>*</RequiredMark></LabelSection>
              <InputSection>
                <StyledTextField
                  type="password"
                  placeholder="영문, 숫자 조합 6~12자"
                  value={formData.loginPw}
                  onChange={handleInputChange('loginPw')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>

            {/* 비밀번호 확인 */}
            <InputRow>
              <LabelSection>비밀번호 확인<RequiredMark>*</RequiredMark></LabelSection>
              <InputSection>
                <StyledTextField
                  type="password"
                  placeholder="비밀번호를 한번 더 입력해주세요"
                  value={formData.confirmPw}
                  onChange={handleInputChange('confirmPw')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>

            {/* 이름 */}
            <InputRow>
              <LabelSection>이름<RequiredMark>*</RequiredMark></LabelSection>
              <InputSection>
                <StyledTextField
                  placeholder="이름을 입력하세요"
                  value={formData.guardianName}
                  onChange={handleInputChange('guardianName')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>

            {/* 연락처 */}
            <InputRow>
              <LabelSection>연락처</LabelSection>
              <InputSection>
                <StyledTextField
                  placeholder="ex) 010-1234-5678"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>

            {/* 이메일 */}
            <InputRow>
              <LabelSection>이메일</LabelSection>
              <InputSection>
                <StyledTextField
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  variant="outlined"
                />
              </InputSection>
            </InputRow>
          </InputTable>
        </FormContainer>

        {/* 개인정보 수집 동의 */}
        <AgreementContainer>
          <AgreementTitle>📋 개인정보 수집 및 이용 동의</AgreementTitle>
          
          <AgreementItem>
            <Checkbox
              checked={agreements.service}
              onChange={handleAgreementChange('service')}
              sx={{
                color: '#1976d2',
                '&.Mui-checked': { color: '#1976d2' }
              }}
            />
            <AgreementLabel>서비스 이용약관 동의 (필수)</AgreementLabel>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => handleViewTerms('service')}
              sx={{ 
                marginLeft: 'auto', 
                color: '#0869CC', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'Pretendard',
                fontSize: '14px'
              }}
            >
              보기
            </Link>
          </AgreementItem>

          <AgreementItem>
            <Checkbox
              checked={agreements.privacy}
              onChange={handleAgreementChange('privacy')}
              sx={{
                color: '#1976d2',
                '&.Mui-checked': { color: '#1976d2' }
              }}
            />
            <AgreementLabel>개인정보 처리방침 동의 (필수)</AgreementLabel>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => handleViewTerms('privacy')}
              sx={{ 
                marginLeft: 'auto', 
                color: '#0869CC', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'Pretendard',
                fontSize: '14px'
              }}
            >
              보기
            </Link>
          </AgreementItem>

          <AgreementItem>
            <Checkbox
              checked={agreements.location}
              onChange={handleAgreementChange('location')}
              sx={{
                color: '#1976d2',
                '&.Mui-checked': { color: '#1976d2' }
              }}
            />
            <AgreementLabel>위치기반 서비스 이용약관 동의 (필수)</AgreementLabel>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => handleViewTerms('location')}
              sx={{ 
                marginLeft: 'auto', 
                color: '#0869CC', 
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'Pretendard',
                fontSize: '14px'
              }}
            >
              보기
            </Link>
          </AgreementItem>
        </AgreementContainer>

        {/* 에러/성공 메시지 */}
        <ErrorContainer>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%',
                fontSize: '16px',
                borderRadius: '8px'
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
                borderRadius: '8px'
              }}
            >
              {success}
            </Alert>
          )}
        </ErrorContainer>

        {/* 버튼들 (가로 배치) */}
        <ButtonContainer>
          <RegisterButton
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
          >
            회원가입
          </RegisterButton>

          <BackButton
            variant="contained"
            onClick={handleBack}
            disabled={loading}
          >
            로그인으로 돌아가기
          </BackButton>
        </ButtonContainer>
        
        {/* 약관 팝업 */}
        <StyledDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitleStyled>
            {termsContent[dialogType]?.title}
          </DialogTitleStyled>
          <DialogContentStyled>
          <Box sx={{ 
          whiteSpace: 'pre-line', 
          minHeight: '300px',
          '& h4': {
          color: '#00458B',
          fontWeight: 700,
          fontSize: '16px',
            marginTop: '24px',
              marginBottom: '12px',
            paddingLeft: '8px',
              borderLeft: '4px solid #0869CC'
            },
            '& p': {
              marginBottom: '16px',
              color: '#555'
            },
            '& ul': {
              paddingLeft: '20px',
              marginBottom: '16px'
            },
            '& li': {
              marginBottom: '8px',
              color: '#666'
            }
          }}>
            {dialogType && renderTermsContent(dialogType)}
          </Box>
          </DialogContentStyled>
          <DialogActions sx={{ 
            padding: '20px 28px', 
            backgroundColor: '#f8fbff',
            borderTop: '1px solid #e8f4fd'
          }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 600,
                fontSize: '16px',
                color: '#666',
                borderColor: '#ddd',
                borderRadius: '10px',
                padding: '12px 24px',
                minWidth: '100px',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              닫기
            </Button>
            <Button
              onClick={handleAcceptTerms}
              variant="contained"
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 600,
                fontSize: '16px',
                backgroundColor: '#0869CC',
                borderRadius: '10px',
                padding: '12px 24px',
                minWidth: '140px',
                marginLeft: '12px',
                boxShadow: '0 4px 12px rgba(8, 105, 204, 0.3)',
                '&:hover': {
                  backgroundColor: '#0653A3',
                  boxShadow: '0 6px 16px rgba(8, 105, 204, 0.4)'
                }
              }}
            >
              확인 및 동의
            </Button>
          </DialogActions>
        </StyledDialog>
      </MainBoard>
    </PageContainer>
  );
};

export default Register;