import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { MyLocation, Place, Search, LocationOn } from '@mui/icons-material';
import { searchAddressToCoord } from '../../utils/kakaoAPI';

const LocationSettingModal = ({ open, onClose, onLocationSet }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 주요 부산 지역 프리셋
  const busanPresets = [
    { name: '부산시청', address: '부산 연제구 중앙대로 1001', lat: 35.1796, lng: 129.0756 },
    { name: '해운대해수욕장', address: '부산 해운대구 해운대해변로', lat: 35.1631, lng: 129.1635 },
    { name: '서면역', address: '부산 부산진구 서면', lat: 35.1578, lng: 129.0600 },
    { name: '남포동', address: '부산 중구 남포동', lat: 35.0979, lng: 129.0302 },
    { name: '광안리해수욕장', address: '부산 수영구 광안해변로', lat: 35.1532, lng: 129.1188 },
    { name: '센텀시티', address: '부산 해운대구 센텀중앙로', lat: 35.1689, lng: 129.1310 },
    { name: '부산대학교', address: '부산 금정구 부산대학로63번길 2', lat: 35.2332, lng: 129.0794 },
    { name: '동래역', address: '부산 동래구 동래역', lat: 35.2055, lng: 129.0788 }
  ];

  // 주소 검색
  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) {
      setError('검색할 주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await searchAddressToCoord(searchQuery);
      
      if (result.success) {
        setSearchResults([{
          address: result.address,
          roadAddress: result.roadAddress,
          x: result.x,
          y: result.y
        }]);
      } else {
        setError('주소를 찾을 수 없습니다. 다시 시도해주세요.');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('주소 검색 오류:', err);
      setError('주소 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  // 프리셋 선택
  const handlePresetSelect = (preset) => {
    setSelectedLocation({
      name: preset.name,
      address: preset.address,
      latitude: preset.lat,
      longitude: preset.lng
    });
    setError('');
  };

  // 검색 결과 선택
  const handleSearchResultSelect = (result) => {
    setSelectedLocation({
      name: result.address,
      address: result.address,
      latitude: result.y,
      longitude: result.x
    });
    setError('');
  };

  // 현재 위치 가져오기
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          name: '현재 위치',
          address: '현재 위치 (GPS)',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setError('');
        setLoading(false);
      },
      (error) => {
        setError(`위치를 가져올 수 없습니다: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 저장
  const handleSave = () => {
    if (!selectedLocation) {
      setError('위치를 선택해주세요.');
      return;
    }

    onLocationSet({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: selectedLocation.address,
      isManual: true
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          <Typography variant="h6">위치 설정</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* 현재 위치 가져오기 버튼 */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<MyLocation />}
          onClick={handleGetCurrentLocation}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          현재 위치 자동으로 가져오기
        </Button>

        <Divider sx={{ mb: 3 }}>또는</Divider>

        {/* 주소 검색 */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          주소로 검색하기
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="예: 부산 금정구, 동래역, 부산대학교"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAddressSearch} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <Search />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              검색 결과
            </Typography>
            <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {searchResults.map((result, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleSearchResultSelect(result)}>
                    <ListItemText
                      primary={result.address}
                      secondary={result.roadAddress || null}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* 부산 주요 지역 */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          부산 주요 지역 선택
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 1, 
          mb: 3 
        }}>
          {busanPresets.map((preset) => (
            <Button
              key={preset.name}
              variant={selectedLocation?.name === preset.name ? "contained" : "outlined"}
              size="small"
              onClick={() => handlePresetSelect(preset)}
              startIcon={<Place />}
              sx={{ justifyContent: 'flex-start' }}
            >
              {preset.name}
            </Button>
          ))}
        </Box>

        {/* 선택된 위치 표시 */}
        {selectedLocation && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              선택된 위치
            </Typography>
            <Typography variant="body2">
              <strong>{selectedLocation.name}</strong>
              <br />
              {selectedLocation.address}
              <br />
              <small>
                위도: {selectedLocation.latitude.toFixed(6)}, 
                경도: {selectedLocation.longitude.toFixed(6)}
              </small>
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          💡 팁: 주소를 입력하거나 주요 지역을 선택하면 자동으로 좌표가 설정됩니다.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!selectedLocation}
        >
          위치 설정
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationSettingModal;
