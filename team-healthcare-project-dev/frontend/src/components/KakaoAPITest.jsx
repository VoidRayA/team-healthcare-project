// =================================================================
// 카카오 API 사용 예시 컴포넌트 (2025.07.08 신규 추가)
// 목적: Home.jsx에서 카카오 API를 활용한 병원/약국 검색 데모
// =================================================================

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Alert,
  TextField,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalHospitalOutlined,
  PharmacyOutlined,
  EmergencyOutlined,
  LocationOnOutlined,
  SearchOutlined
} from '@mui/icons-material';

// 카카오 API 함수들 import
import { 
  getBusanHospitalsFromKakao, 
  getNearbyPharmacies, 
  getEmergencyRooms,
  searchAddress 
} from '../api/apiClient';
import { getCurrentLocation } from '../utils/kakaoAPI';

const KakaoTestContainer = styled(Paper)({
  padding: '20px',
  margin: '20px 0',
  borderRadius: '15px',
  backgroundColor: '#f8f9fa'
});

const KakaoTestSection = styled(Box)({
  marginBottom: '20px',
  '& .MuiButton-root': {
    margin: '5px',
    borderRadius: '10px'
  }
});

const ResultList = styled(List)({
  maxHeight: '300px',
  overflow: 'auto',
  backgroundColor: 'white',
  borderRadius: '10px',
  border: '1px solid #e0e0e0'
});

const KakaoAPITest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 현재 위치 얻기
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setResults([{
        type: 'location',
        data: `현재 위치: 경도 ${location.x.toFixed(6)}, 위도 ${location.y.toFixed(6)}`
      }]);
      
    } catch (err) {
      setError('위치 정보를 가져올 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 부산 병원 검색 (카카오 API)
  const handleSearchHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getBusanHospitalsFromKakao(currentLocation);
      
      if (result.success) {
        setResults([
          {
            type: 'info',
            data: `카카오 API로 ${result.hospitals.length}개 병원을 찾았습니다.`
          },
          ...result.hospitals.map(hospital => ({
            type: 'hospital',
            data: hospital
          }))
        ]);
      }
      
    } catch (err) {
      setError('병원 검색 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 약국 검색
  const handleSearchPharmacies = async () => {
    if (!currentLocation) {
      setError('먼저 현재 위치를 설정해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await getNearbyPharmacies(currentLocation);
      
      if (result.success) {
        setResults([
          {
            type: 'info',
            data: `주변 ${result.pharmacies.length}개 약국을 찾았습니다.`
          },
          ...result.pharmacies.map(pharmacy => ({
            type: 'pharmacy',
            data: pharmacy
          }))
        ]);
      }
      
    } catch (err) {
      setError('약국 검색 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 응급실 검색
  const handleSearchEmergencyRooms = async () => {
    if (!currentLocation) {
      setError('먼저 현재 위치를 설정해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await getEmergencyRooms(currentLocation);
      
      if (result.success) {
        setResults([
          {
            type: 'info',
            data: `주변 ${result.emergencyRooms.length}개 응급실을 찾았습니다.`
          },
          ...result.emergencyRooms.map(emergency => ({
            type: 'emergency',
            data: emergency
          }))
        ]);
      }
      
    } catch (err) {
      setError('응급실 검색 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 주소 검색
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await searchAddress(searchQuery);
      
      if (result.success) {
        setResults([{
          type: 'address',
          data: result
        }]);
      }
      
    } catch (err) {
      setError('주소 검색 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = (item, index) => {
    const { type, data } = item;

    if (type === 'info' || type === 'location') {
      return (
        <ListItem key={index}>
          <ListItemText 
            primary={data}
            sx={{ color: type === 'info' ? '#1976d2' : '#666' }}
          />
        </ListItem>
      );
    }

    if (type === 'address') {
      return (
        <ListItem key={index}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              📍 {data.address}
            </Typography>
            {data.roadAddress && (
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                🛣️ {data.roadAddress}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
              좌표: {data.coordinates.x.toFixed(6)}, {data.coordinates.y.toFixed(6)}
            </Typography>
          </Box>
        </ListItem>
      );
    }

    // 병원, 약국, 응급실 데이터 렌더링
    const getIcon = () => {
      switch (type) {
        case 'hospital': return '🏥';
        case 'pharmacy': return '💊';
        case 'emergency': return '🚑';
        default: return '📍';
      }
    };

    return (
      <ListItem key={index} sx={{ borderBottom: '1px solid #f0f0f0' }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {getIcon()} {data.name}
            </Typography>
            {data.distance && (
              <Chip 
                label={`${data.distance}m`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
            📍 {data.address}
          </Typography>
          
          {data.phone && (
            <Typography variant="body2" sx={{ color: '#1976d2', mb: 0.5 }}>
              📞 {data.phone}
            </Typography>
          )}
          
          {data.category && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              🏷️ {data.category}
            </Typography>
          )}
        </Box>
      </ListItem>
    );
  };

  return (
    <KakaoTestContainer elevation={2}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
        🗺️ 카카오 API 테스트
      </Typography>

      {/* 위치 설정 섹션 */}
      <KakaoTestSection>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          1. 위치 설정
        </Typography>
        <Button
          variant="contained"
          startIcon={<LocationOnOutlined />}
          onClick={handleGetCurrentLocation}
          disabled={loading}
          sx={{ backgroundColor: '#4caf50' }}
        >
          현재 위치 가져오기
        </Button>
        {currentLocation && (
          <Chip 
            label="위치 설정 완료" 
            color="success" 
            sx={{ ml: 1 }}
          />
        )}
      </KakaoTestSection>

      {/* 주소 검색 섹션 */}
      <KakaoTestSection>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          2. 주소 검색
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            placeholder="주소를 입력하세요 (예: 부산시 해운대구)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchOutlined />}
            onClick={handleSearchAddress}
            disabled={loading}
          >
            검색
          </Button>
        </Box>
      </KakaoTestSection>

      {/* 장소 검색 섹션 */}
      <KakaoTestSection>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          3. 주변 장소 검색
        </Typography>
        <Button
          variant="contained"
          startIcon={<LocalHospitalOutlined />}
          onClick={handleSearchHospitals}
          disabled={loading}
          sx={{ backgroundColor: '#2196f3' }}
        >
          부산 병원 검색
        </Button>
        
        <Button
          variant="contained"
          startIcon={<PharmacyOutlined />}
          onClick={handleSearchPharmacies}
          disabled={loading || !currentLocation}
          sx={{ backgroundColor: '#ff9800' }}
        >
          주변 약국 검색
        </Button>
        
        <Button
          variant="contained"
          startIcon={<EmergencyOutlined />}
          onClick={handleSearchEmergencyRooms}
          disabled={loading || !currentLocation}
          sx={{ backgroundColor: '#f44336' }}
        >
          응급실 검색
        </Button>
      </KakaoTestSection>

      {/* 로딩 및 에러 메시지 */}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">검색 중...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* 결과 리스트 */}
      {results.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            검색 결과
          </Typography>
          <ResultList>
            {results.map(renderResultItem)}
          </ResultList>
        </Box>
      )}
    </KakaoTestContainer>
  );
};

export default KakaoAPITest;
