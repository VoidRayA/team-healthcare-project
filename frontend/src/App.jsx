import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import GJoinpage from './components/GJoinpage';
import ProfileEdit from './components/ProfileEdit';
import ProfileManagement from './components/ProfileManagement';
import Home from './components/Home';
import SeniorList from './components/SeniorList';
import Sjoinpage from './components/Sjoinpage';
import Daily from './components/Daily';
import Terms from './components/policy/Terms';
import Privacy from './components/policy/Privacy';
import Settings from './components/Setting';
import Support from './components/policy/Support';
import About from './components/policy/About';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';
import MapExample from './components/MapExample';
import MapDebugTest from './components/MapDebugTest';
import MapDemo from './components/MapDemo';

function App() {
  const [authState, setAuthState] = useState(isAuthenticated());

  // 디버깅을 위해 현재 상태 출력
  console.log('현재 인증 상태:', authState);
  console.log('sessionStorage jwt:', sessionStorage.getItem('jwt'));

  useEffect(() => {
    // 주기적으로 인증 상태 확인 (토큰 만료 체크)
    const interval = setInterval(() => {
      const currentAuth = isAuthenticated();
      if (currentAuth !== authState) {
        setAuthState(currentAuth);
      }
    }, 30000); // 30초마다 확인

    // 페이지 포커스시 인증 상태 재확인
    const handleFocus = () => {
      setAuthState(isAuthenticated());
    };

    // storage 이벤트는 sessionStorage에서는 동작하지 않으므로
    // 대신 커스텀 이벤트를 사용할 수 있습니다
    const handleAuthChange = () => {
      setAuthState(isAuthenticated());
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('authStateChange', handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, [authState]);

  return (
    <BrowserRouter>      
      <Routes>
        <Route 
          path="/" 
          element={!authState ? <Login /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/login" 
          element={<Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!authState ? <Register /> : <Navigate to="/home" replace />} 
        />
        <Route 
          path="/gjoin" 
          element={!authState ? <GJoinpage /> : <Navigate to="/home" replace />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/profile/edit" 
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/management" 
          element={
            <ProtectedRoute>
              <ProfileManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ProfileManagement" 
          element={
            <ProtectedRoute>
              <ProfileManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seniors" 
          element={
            <ProtectedRoute>
              <SeniorList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sjoin" 
          element={
            <ProtectedRoute>
              <Sjoinpage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/senior/edit/:id" 
          element={
            <ProtectedRoute>
              <Sjoinpage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/daily" 
          element={
            <ProtectedRoute>
              <Daily />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute>
              <Daily />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* 정책 페이지들 - 로그인 없이도 접근 가능 */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<About />} />
        
        {/* 지도 테스트 페이지 */}
        <Route path="/map-test" element={<MapExample />} />
        <Route path="/map-debug" element={<MapDebugTest />} />
        <Route path="/map-demo" element={<MapDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;