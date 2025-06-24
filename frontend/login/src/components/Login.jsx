import { useState } from 'react';
import axios from 'axios';
import { TextField, Typography } from '@mui/material';
import '../components/Login.css';
import lockicon from '../images/lock_icon.png';

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
        alert('로그인 성공');
      }
    } catch (err) {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 왼쪽 배경 이미지 영역 */}
      <div className="login-image"></div>

        <div className="login-box">
          {/* 자물쇠 아이콘 + 로그인 텍스트 */}
          <div className="login-header">
            {/* <div className="lock-icon"></div> */}
            <div className="login-title"><img src={lockicon}/>로그인</div>
          </div>

          {/* 아이디 입력 박스 */}
          <div className="id-box">
            <TextField
              variant="standard"
              placeholder="아이디"
              name="userid"
              fullWidth
              value={user.userid}
              onChange={handleChange}
              InputProps={{ disableUnderline: true }}
              sx={{
                paddingLeft: '15px',
                paddingTop: '5px',
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  color: '#333'
                }
              }}
            />
          </div>

          {/* 비밀번호 입력 박스 */}
          <div className="pw-box">
            <TextField
              variant="standard"
              placeholder="비밀번호"
              name="password"
              type="password"
              fullWidth
              value={user.password}
              onChange={handleChange}
              InputProps={{ disableUnderline: true }}
              sx={{
                paddingLeft: '15px',
                paddingTop: '5px',
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                  color: '#333'
                }
              }}
            />
          </div>

          {/* 로그인 버튼 */}
          <button className="login-button" onClick={handleLogin} disabled={loading}>
            <Typography sx={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
              {loading ? '로그인 중...' : '로그인'}
            </Typography>
          </button>

          {/* 회원가입 버튼 */}
          <button className="join-button">
            <Typography sx={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
              회원가입
            </Typography>
          </button>
          {/* 오류 메시지 */}
          {error && (
          <Typography className='loginError'
            color="error"
            variant="body2"
          >
            {error}
          </Typography>
        )}
        </div>

        
    </div>
  );
};

export default Login;