import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import lock_icon from '../images/lock_icon.png';

const Login = () => {
  const [user, setUser] = useState({ userid: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        user,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const jwtToken = response.headers.authorization;
      if (jwtToken) {
        sessionStorage.setItem('jwt', jwtToken);
        alert('로그인 성공!');
      }
    } catch (err) {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} alignItems="center" mt={2}
      sx={{
        position: 'relative',
        zIndex: 1, // 이미지 위에 오도록 설정
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
            <img src={lock_icon} alt=" " style={{width: 30, height:30}}/>
            <Typography component="h1" variant="h5" color='black'>로그인</Typography>
          </Box>

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="아이디"
            name="userid"
            value={user.userid}
            onChange={handleChange}
            autoFocus
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </Container>
    </Stack>
  );
};

export default Login;