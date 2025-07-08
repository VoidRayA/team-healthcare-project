import React, { useState } from 'react';
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

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: 실제 비밀번호 확인 API 호출
      // const response = await verifyPassword(password);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 실제 API가 준비되면 아래 임시 코드 제거
      console.log('비밀번호 확인 API 기다리는 중...');
      setError('비밀번호 확인 기능이 준비 중입니다.');
      
    } catch (err) {
      console.error('비밀번호 확인 오류:', err);
      setError('비밀번호 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setLoading(false);
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