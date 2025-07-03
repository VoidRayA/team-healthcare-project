import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProfileEdit from './components/ProfileEdit';
import Home from './components/Home';
import Terms from './components/policy/Terms';
import Privacy from './components/policy/Privacy';
import Support from './components/policy/Support';
import About from './components/policy/About';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwt'));

  // 디버깅을 위해 현재 상태 출력
  console.log('현재 인증 상태:', isAuthenticated);
  console.log('localStorage jwt:', localStorage.getItem('jwt'));

  useEffect(() => {
    // localStorage 변경 감지를 위한 커스텀 이벤트 리스너
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('jwt'));
    };

    // 페이지 포커스시 인증 상태 재확인
    const handleFocus = () => {
      setIsAuthenticated(!!localStorage.getItem('jwt'));
    };

    // 주기적으로 인증 상태 확인 (폴링 방식)
    const interval = setInterval(() => {
      const currentAuth = !!localStorage.getItem('jwt');
      if (currentAuth !== isAuthenticated) {
        setIsAuthenticated(currentAuth);
      }
    }, 1000); // 1초마다 확인

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>      
      <Routes>
        <Route 
          path="/" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/profile/edit" 
          element={isAuthenticated ? <ProfileEdit /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/home" 
          element={isAuthenticated ? <Home /> : <Navigate to="/" replace />} 
        />
        {/* 정책 페이지들 - 로그인 없이도 접근 가능 */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;