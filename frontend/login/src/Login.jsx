import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

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
        `${process.env.REACT_APP_API_URL}/login`,
        user,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const jwtToken = response.headers.authorization;
      if (jwtToken) {
        sessionStorage.setItem('jwt', jwtToken);
        alert('로그인 성공!');
        // 예: 홈 페이지 이동
      }
    } catch (err) {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <Typography component="h1" variant="h5">로그인</Typography>

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
  );
};

export default Login;