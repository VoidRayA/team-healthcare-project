import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';

const MapDebugTest = () => {
  const [kakaoStatus, setKakaoStatus] = useState('확인 중...');
  const [mapCreated, setMapCreated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkKakaoStatus();
  }, []);

  const checkKakaoStatus = () => {
    // 카카오 객체 확인
    if (window.kakao) {
      setKakaoStatus('kakao 객체 존재');
      
      if (window.kakao.maps) {
        setKakaoStatus('kakao.maps 객체 존재 - SDK 로드 완료!');
      } else {
        setKakaoStatus('kakao 객체는 있지만 maps가 없음');
      }
    } else {
      setKakaoStatus('kakao 객체가 없음 - SDK 로드 실패');
    }
  };

  const createSimpleMap = () => {
    try {
      if (!window.kakao || !window.kakao.maps) {
        setError('카카오맵 SDK가 로드되지 않았습니다.');
        return;
      }

      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 기본 좌표
          level: 3
        };
        
        const map = new window.kakao.maps.Map(container, options);
        setMapCreated(true);
        setError(null);
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        카카오맵 디버그 테스트
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          1. 카카오 SDK 상태
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          상태: <strong>{kakaoStatus}</strong>
        </Typography>
        <Button variant="contained" onClick={checkKakaoStatus}>
          상태 다시 확인
        </Button>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          2. 환경 변수
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          VITE_KAKAO_JAVASCRIPT_KEY: {import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || '설정되지 않음'}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          VITE_KAKAO_REST_API_KEY: {import.meta.env.VITE_KAKAO_REST_API_KEY || '설정되지 않음'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          3. 지도 생성 테스트
        </Typography>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={createSimpleMap}
          disabled={mapCreated}
        >
          {mapCreated ? '지도 생성됨' : '지도 생성하기'}
        </Button>
        
        <Box 
          id="map" 
          sx={{ 
            width: '100%', 
            height: '400px', 
            mt: 2,
            border: '1px solid #ddd',
            backgroundColor: '#f0f0f0'
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          에러: {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          4. 문제 해결 방법
        </Typography>
        <Typography variant="body2" component="ul">
          <li>index.html에 스크립트 태그가 올바르게 추가되었는지 확인</li>
          <li>카카오 개발자 센터에서 JavaScript 키 확인</li>
          <li>카카오 개발자 센터에서 사이트 도메인 등록 확인</li>
          <li>브라우저 콘솔에서 네트워크 에러 확인</li>
          <li>광고 차단기나 보안 프로그램이 스크립트를 차단하는지 확인</li>
        </Typography>
      </Paper>
    </Box>
  );
};

export default MapDebugTest;
