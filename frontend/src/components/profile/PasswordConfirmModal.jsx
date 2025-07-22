import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LockOutlined } from '@mui/icons-material';
import { verifyGuardianPassword } from '../../api/apiClient';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: '20px',
    minWidth: '400px',
    maxWidth: '500px'
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  textAlign: 'center',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '24px',
  color: '#1976d2',
  paddingBottom: '10px'
});

const IconContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px'
});

const StyledTextField = styled(TextField)({
  width: '100%',
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#1976d2'
    },
    '&:hover fieldset': {
      borderColor: '#1565c0'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2'
    }
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Pretendard',
    fontSize: '16px'
  }
});

const ConfirmButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: '#FFFFFF',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '16px',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#1565c0'
  },
  '&:disabled': {
    backgroundColor: '#ccc'
  }
});

const CancelButton = styled(Button)({
  color: '#666',
  fontFamily: 'Pretendard',
  fontWeight: 600,
  fontSize: '16px',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  '&:hover': {
    backgroundColor: '#f5f5f5'
  }
});

const PasswordConfirmModal = ({ open, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isProcessingRef = useRef(false);
  const hasSubmittedSuccessfullyRef = useRef(false); // 성공적으로 제출 완료된 경우

  // 모달이 열릴 때마다 상태 초기화 (성공 상태는 유지)
  useEffect(() => {
    if (open && !hasSubmittedSuccessfullyRef.current) {
      console.log('비밀번호 모달 열림 - 상태 초기화');
      setPassword('');
      setError('');
      setLoading(false);
      isProcessingRef.current = false;
    } else if (open && hasSubmittedSuccessfullyRef.current) {
      console.log('이미 비밀번호 인증 완료됨 - 모달 자동 닫기');
      onConfirm(); // 즉시 성공 처리
    }
  }, [open, onConfirm]);

  // 성공 시 모달을 열지 않도록 처리
  if (hasSubmittedSuccessfullyRef.current) {
    return null;
  }

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    // 이미 제출이 완료된 경우 중단
    if (hasSubmittedSuccessfullyRef.current) {
      console.log('이미 비밀번호 제출이 완료되었습니다.');
      return;
    }

    // 이미 처리 중이면 중단
    if (isProcessingRef.current) {
      console.log('중복 호출 방지: 이미 비밀번호 처리 중입니다.');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setError('');

    try {
      console.log('비밀번호 확인 API 호출 시작');
      
      // 실제 비밀번호 확인 API 호출
      const response = await verifyGuardianPassword(password);
      console.log('비밀번호 확인 성공:', response);
      
      // 성공적으로 제출 완료 표시
      hasSubmittedSuccessfullyRef.current = true;
      
      // 비밀번호 확인 성공 시 onConfirm 콜백 호출
      onConfirm();
      
    } catch (err) {
      console.error('비밀번호 확인 오류:', err);
      
      // 에러 메시지 처리
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 400) {
        setError('비밀번호가 올바르지 않습니다.');
      } else {
        setError('비밀번호 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
      console.log('비밀번호 확인 처리 완료');
    }
  };

  const handleClose = () => {
    console.log('비밀번호 모달 닫기');
    setPassword('');
    setError('');
    setLoading(false);
    isProcessingRef.current = false;
    // hasSubmittedSuccessfullyRef는 성공 시 유지
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        비밀번호 확인
      </StyledDialogTitle>
      
      <DialogContent>
        <IconContainer>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LockOutlined sx={{ color: 'white', fontSize: 30 }} />
          </Box>
        </IconContainer>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#666',
            fontFamily: 'Pretendard',
            fontSize: '16px'
          }}
        >
          회원정보 관리 접근을 위해 비밀번호를 확인해주세요.
        </Typography>

        <StyledTextField
          type="password"
          label="현재 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="비밀번호를 입력하세요"
          disabled={loading}
          autoFocus
        />

        {error && (
          <Alert severity="error" sx={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: '10px', paddingBottom: '20px' }}>
        <CancelButton onClick={handleClose} disabled={loading}>
          취소
        </CancelButton>
        <ConfirmButton
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? '확인 중...' : '확인'}
        </ConfirmButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default PasswordConfirmModal;