import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';

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
          path="/home" 
          element={isAuthenticated ? <Home /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;