import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

// 분리된 컴포넌트들 import
import Sidebar from '../common/Sidebar';
import WeatherWidget from './WeatherWidget';
import VitalSignsChart from './VitalSignsChart';
import CalendarWidget from './CalendarWidget';
import SeniorSelector from './SeniorSelector';
import HospitalInfo from './HospitalInfo';
import RecentActivities from './RecentActivities';
import HospitalMapModal from '../modals/HospitalMapModal';

// API 및 유틸리티 import
import { getSeniorsForDate, getSeniorsWithPagination, getSeniorDailyActivities, getScheduleDropdownItems } from '../../api/apiClient';
import { searchAddressToCoord, searchPlacesByKeyword } from '../../utils/kakaoAPI';
import { enhancedAddressSearch, validateSearchResult } from '../../utils/enhancedAddressSearch';
import { getUserInfo } from '../../utils/auth';
import { getCurrentPosition, checkGeolocationSupport } from '../../utils/geolocation';

// 로컬 시간대 기준 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Home = () => {
  const navigate = useNavigate();
  
  // 기본 state들
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState('홈');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });

  // Senior 관련 state
  const [seniors, setSeniors] = useState([]);
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [loading, setLoading] = useState(true);

  // 병원 관련 state
  const [recommendedHospital, setRecommendedHospital] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  // 최근 액션 관련 state
  const [recentActions, setRecentActions] = useState([
    { text: '회원정보 관리', lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { text: '보호 대상자 관리', lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { text: '안전 모니터링', lastUsed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { text: '알림 설정', lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
  ]);

  // 달력 관련 state 
  const totalRightBoxHeight = 850; // 고정값

  // Senior 선택 핸들러
  const handleSeniorSelect = (senior, useCurrentLocation = false) => {
    console.log('선택된 Senior:', senior);
    setSelectedSenior(senior);
    
    if (useCurrentLocation) {
      console.log('🗺️ 현재위치 기준으로 병원 검색');
      loadRecommendedHospital();
    } else if (senior.address) {
      console.log('🏠 Senior 주소 기준으로 병원 검색:', senior.address);
      loadHospitalsByAddress(senior.address);
    } else {
      console.log('🗺️ 주소 없음 - 현재위치 사용');
      loadRecommendedHospital();
    }
  };

  // 병원 선택 핸들러
  const handleHospitalSelect = (hospital) => {
    setRecommendedHospital(hospital);
    console.log('병원 선택 완료:', hospital.yadmNm);
  };

  // 최근 액션 업데이트
  const updateRecentAction = (actionText) => {
    setRecentActions(prev => 
      prev.map(action => 
        action.text === actionText 
          ? { ...action, lastUsed: new Date() }
          : action
      ).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
    );
  };

  // 날짜 변경 핸들러
  const handleDateChange = (date) => {
    console.log('📅 달력에서 선택된 날짜:', date);
    setSelectedDate(date);
    loadDataForDate(date);
  };

  // 보호 대상자 목록 로드
  const loadSeniors = async () => {
    try {
      const response = await getSeniorsWithPagination(0, 100, 'createdAt,desc');
      console.log('getSeniorsWithPagination API 응답:', response);
      const seniorsList = response.content || [];
      console.log('로드된 Senior 목록:', seniorsList);
      setSeniors(seniorsList);
      
      // 첫 번째 Senior 자동 선택
      if (seniorsList.length > 0 && !selectedSenior) {
        const targetSenior = seniorsList[0];
        
        console.log('기본 선택된 Senior:', targetSenior);
        setSelectedSenior(targetSenior);
        
        // 선택된 Senior의 주소로 병원 검색
        if (targetSenior.address) {
          loadHospitalsByAddress(targetSenior.address);
        }
      }
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    }
  };

  // 향상된 주소 기반 병원 검색
  const loadHospitalsByAddress = async (address) => {
    try {
      console.log('🏥 향상된 주소 기반 병원 검색 시작:', address);
      setHospitalLoading(true);
      
      // 향상된 주소 검색 사용
      console.log('🔍 향상된 주소 검색 실행...');
      const searchResult = await enhancedAddressSearch(address);
      
      if (!searchResult.success) {
        console.error('❌ 주소 검색 실패:', searchResult.message);
        // 기본값으로 현재 위치 사용
        console.log('🔄 현재 위치로 대체 검색');
        await loadRecommendedHospital();
        return;
      }
      
      console.log('✅ 주소 검색 성공!');
      console.log(`📍 좌표: 위도 ${searchResult.latitude}, 경도 ${searchResult.longitude}`);
      
      // 해당 좌표로 병원 검색
      const hospitalResult = await searchNearbyHospitals(searchResult.latitude, searchResult.longitude);
      
      if (hospitalResult.success && hospitalResult.places) {
        // 인간 의료시설만 필터링
        const filteredPlaces = hospitalResult.places.filter(place => {
          const categoryName = place.category || '';
          const placeName = place.name || '';
          
          // 동물병원 제외
          if (categoryName.includes('동물병원') || 
              placeName.includes('동물병원') ||
              placeName.includes('수의사') ||
              placeName.includes('수의') ||
              placeName.includes('동물의료') ||
              placeName.includes('펫') ||
              placeName.includes('애니멀')) {
            console.log(`❌ 동물병원 제외: ${placeName}`);
            return false;
          }
          
          console.log(`✅ 인간 의료시설 포함: ${placeName}`);
          return true;
        });
        
        const kakaoHospitals = filteredPlaces.map(place => ({
          yadmNm: place.name,
          telno: place.phone || '전화번호 정보 없음',
          addr: place.roadAddress || place.address,
          distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
          categoryName: place.category,
          latitude: place.y,
          longitude: place.x
        }));
        
        setNearbyHospitals(kakaoHospitals);
        setRecommendedHospital(kakaoHospitals[0]);
        
        console.log(`✅ ${kakaoHospitals.length}개 병원 검색 완료`);
        
        // Senior의 위치를 currentPosition으로 설정
        setCurrentPosition({
          latitude: searchResult.latitude,
          longitude: searchResult.longitude,
          address: address,
          resolvedAddress: searchResult.address,
          isSeniorLocation: true,
          searchMethod: searchResult.method,
          searchScore: searchResult.score
        });
      } else {
        console.warn('❌ 병원 검색 결과 없음');
        // 기본값으로 현재 위치 사용
        await loadRecommendedHospital();
      }
    } catch (error) {
      console.error('❌ 향상된 주소 기반 병원 검색 오류:', error);
      // 기본값으로 현재 위치 사용
      await loadRecommendedHospital();
    } finally {
      setHospitalLoading(false);
    }
  };

  // 현재 위치 기반 병원 검색
  const loadRecommendedHospital = async () => {
    try {
      console.log('추천 병원 조회 시작');
      setHospitalLoading(true);
      
      console.log('🗺️ 현재위치 획득 시도 중...');
      const position = await getCurrentPosition({ 
        showAlert: false,
        timeout: 15000,
        enableHighAccuracy: true,
        maximumAge: 60000
      });
      const { latitude, longitude } = position;
      setCurrentPosition(position);
      
      console.log('📍 현재 위치 결과:', position);
      
      const result = await searchNearbyHospitals(latitude, longitude);
      
      if (result.success && result.places && result.places.length > 0) {
        // 인간 의료시설만 필터링
        const filteredPlaces = result.places.filter(place => {
          const categoryName = place.category || '';
          const placeName = place.name || '';
          
          // 동물병원 제외
          if (categoryName.includes('동물병원') || 
              placeName.includes('동물병원') ||
              placeName.includes('수의사') ||
              placeName.includes('수의') ||
              placeName.includes('동물의료') ||
              placeName.includes('펫') ||
              placeName.includes('애니멀')) {
            console.log(`❌ 동물병원 제외: ${placeName}`);
            return false;
          }
          
          console.log(`✅ 인간 의료시설 포함: ${placeName}`);
          return true;
        });
        
        const kakaoHospitals = filteredPlaces.map(place => ({
          yadmNm: place.name,
          telno: place.phone || '전화번호 정보 없음',
          addr: place.roadAddress || place.address,
          distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
          categoryName: place.category,
          latitude: place.y,
          longitude: place.x
        }));
        
        setNearbyHospitals(kakaoHospitals);
        setRecommendedHospital(kakaoHospitals[0]);
        
        console.log(`카카오 API로 ${kakaoHospitals.length}개 병원 로드 완료`);
      } else {
        console.warn('카카오 API에서 병원 정보를 찾을 수 없음');
      }
      
    } catch (error) {
      console.error('병원 검색 오류:', error);
    } finally {
      setHospitalLoading(false);
    }
  };

  // 근처 병원 검색
  const searchNearbyHospitals = async (latitude, longitude) => {
    try {
      console.log('🏥 향상된 병원 검색 시작 - 더 많은 병원 찾기');
      
      const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
      
      if (!REST_API_KEY) {
        throw new Error('카카오 API 키가 설정되지 않았습니다.');
      }
      
      const allHospitals = new Map(); // 중복 제거를 위한 Map
      
      // 1. 카테고리 검색 (HP8: 병원)
      console.log('📚 1단계: 카테고리 검색 (병원)');
      for (let page = 1; page <= 2; page++) {
        try {
          const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=HP8&x=${longitude}&y=${latitude}&radius=10000&sort=distance&page=${page}&size=15`,
            {
              headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`
              }
            }
          );
          
          const data = await response.json();
          
          if (data.documents) {
            console.log(`✅ 카테고리 검색 페이지 ${page}: ${data.documents.length}개 결과`);
            data.documents.forEach(place => {
              allHospitals.set(place.id, {
                name: place.place_name,
                phone: place.phone,
                address: place.address_name,
                roadAddress: place.road_address_name,
                distance: place.distance,
                category: place.category_name,
                x: place.x,
                y: place.y,
                source: '카테고리 검색'
              });
            });
          }
          
          // 더 이상 결과가 없으면 중단
          if (data.meta && data.meta.is_end) {
            console.log(`🛑 카테고리 검색 종료 (페이지 ${page})`);
            break;
          }
        } catch (error) {
          console.warn(`⚠️ 카테고리 검색 페이지 ${page} 실패:`, error.message);
        }
      }
      
      // 2. 키워드 검색 - 인간 의료시설 키워드만
      const keywords = ['병원', '의원', '클리닉', '진료소'];
      
      console.log('📚 2단계: 키워드 검색');
      for (const keyword of keywords) {
        try {
          const keywordResult = await searchPlacesByKeyword(keyword, {
            latitude: latitude,
            longitude: longitude,
            radius: 10000,
            sort: 'distance',
            size: 10
          });
          
          if (keywordResult.success && keywordResult.places && keywordResult.places.length > 0) {
            console.log(`✅ 키워드 "${keyword}" 검색: ${keywordResult.places.length}개 결과`);
            keywordResult.places.forEach(place => {
              allHospitals.set(place.id, {
                name: place.place_name || place.name,
                phone: place.phone,
                address: place.address_name || place.address,
                roadAddress: place.road_address_name || place.roadAddress,
                distance: place.distance,
                category: place.category_name || place.category,
                x: place.x,
                y: place.y,
                source: `키워드 "${keyword}"`
              });
            });
          }
        } catch (error) {
          console.warn(`⚠️ 키워드 "${keyword}" 검색 실패:`, error.message);
        }
      }
      
      // 3. 결과 정리 및 정렬 (상위 10개만 선택)
      const hospitalList = Array.from(allHospitals.values()).slice(0, 10);
      
      // 거리순 정렬
      hospitalList.sort((a, b) => {
        const distanceA = parseInt(a.distance) || 999999;
        const distanceB = parseInt(b.distance) || 999999;
        return distanceA - distanceB;
      });
      
      console.log(`🏥 총 ${hospitalList.length}개 인간 의료시설 선택! (상위 10개)`);
      
      return {
        success: true,
        places: hospitalList.map(place => ({
          name: place.name,
          phone: place.phone || '전화번호 정보 없음',
          address: place.address,
          roadAddress: place.roadAddress,
          distance: place.distance ? 
            (parseInt(place.distance) >= 1000 ? 
              `${(parseInt(place.distance) / 1000).toFixed(1)}km` : 
              `${Math.round(parseInt(place.distance))}m`) : '',
          category: place.category,
          x: place.x,
          y: place.y
        }))
      };
    } catch (error) {
      console.error('❌ 카카오 병원 검색 API 오류:', error);
      return { success: false, places: [] };
    }
  };

  // 특정 날짜의 데이터 로드
  const loadDataForDate = async (date) => {
    console.log('📅 달력에서 선택된 날짜:', date);
    setSelectedDate(date);
    
    // Senior 데이터만 로드 (일정 데이터는 RecentActivities에서 직접 처리)
    await loadSeniorDataForDate(date);
  };

  // Senior 데이터 로드
  const loadSeniorDataForDate = async (date) => {
    try {
      setLoading(true);
      
      const dateString = getLocalDateString(date);
      const response = await getSeniorsForDate(dateString);
      console.log(`${dateString} Senior 데이터 응답:`, response);
      
    } catch (error) {
      console.error('Senior 데이터 로드 오류:', error);
      
      if (error.response?.status === 401) {
        console.error('인증 만료. 로그인이 필요합니다.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 최근 활동 데이터 로드 - 제거됨 (RecentActivities에서 독립적으로 처리)
  const loadRecentActivitiesForDate = async (date) => {
    // 이 함수는 더 이상 사용되지 않음
    // RecentActivities 컴포넌트가 직접 데이터를 로드함
    console.log('주의: loadRecentActivitiesForDate는 더 이상 사용되지 않습니다.');
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    const userInfo = getUserInfo();
    console.log('현재 로그인 사용자:', userInfo);
    
    if (userInfo) {
      setGuardianInfo({
        name: userInfo.name,
        loginId: userInfo.loginId,
        role: userInfo.role || 'GUARDIAN'
      });
    }
    
    // 위치 서비스 지원 상태 확인
    checkGeolocationSupport().then(support => {
      console.log('🗺️ 위치 서비스 지원 상태:', support);
    });
    
    loadDataForDate(new Date());
    loadSeniors();
    
  }, []);

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#CCE5FF',
      display: 'flex',  
      gap: 0,
      overflow: 'hidden'
    }}>
      {/* 왼쪽 사이드바 */}
      <Sidebar 
        guardianInfo={guardianInfo}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        updateRecentAction={updateRecentAction}
      />

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        overflow: 'auto',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }}>
        {/* 중앙 메인 콘텐츠 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          padding: 4,
          gap: 2.5
        }}>
          {/* 왼쪽 콘텐츠 */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 상단 헤더 */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '200px',              
              marginBottom: 0, // 완전히 제거
              paddingTop: 1
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1
              }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 5, color: '#333' }}>
                  안녕하세요, <span style={{ color: '#1976d2' }}>{guardianInfo.name}</span> 님
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  오늘도 소중한 분의 안전을 지켜주세요.
                </Typography>
              </Box>
            </Box>

            {/* 하단 3개 박스 */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 2,
              padding: `0 0 0 0` // 패딩도 완전히 제거
            }}>
              {/* 바이탈 사인 차트 */}
              <VitalSignsChart 
                selectedSenior={selectedSenior}
                selectedDate={selectedDate}
              />

              {/* 오늘의 일정 */}
              <RecentActivities 
                selectedDate={selectedDate}
                selectedSenior={selectedSenior}
              />

              {/* 관리 대상자 정보 */}
              <Paper sx={{
                backgroundColor: '#ffffff',
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: 2.5,
                minHeight: '450px',
                overflow: 'auto',
                boxShadow: 2
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ flexShrink: 0 }}>
                  📊 관리 대상자 항목
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 관리 대상자 */}
                  <SeniorSelector 
                    seniors={seniors}
                    selectedSenior={selectedSenior}
                    onSeniorSelect={handleSeniorSelect}
                    loading={loading}
                  />

                  {/* 근처 병원 정보 */}
                  <HospitalInfo 
                    recommendedHospital={recommendedHospital}
                    nearbyHospitals={nearbyHospitals}
                    hospitalLoading={hospitalLoading}
                    onHospitalSelect={handleHospitalSelect}
                    onShowMap={() => setShowMapModal(true)}
                  />
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* 오른쪽 세로 긴 박스 - 달력과 날씨 */}
          <Paper
            sx={{
              width: '320px',
              height: '705px', // ✅ 전체 높이 고정
              backgroundColor: '#ffffff',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              padding: 2,
              display: 'flex',
              flexDirection: 'column',              
              boxShadow: 2,
              transition: 'all 0.3s ease-in-out',
              overflow: 'hidden', // 혹시 넘칠 경우 대비
            }}
          >
            {/* 제목 */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📅 조회 날짜
            </Typography>
            {/* 달력 영역 - 상단 고정 */}
            <Box sx={{
              height: '280px', // 달력 6주 표시 시 최대 높이에 맞춰 고정
              flexShrink: 0, // 크기 고정
              marginBottom: 2
            }}>
              <CalendarWidget
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </Box>
            
            {/* 날씨 위젯 - 하단 고정 */}
            <Box sx={{ 
              flexShrink: 0,
              marginTop: 'flex' // 하단에 배치
            }}>
              <WeatherWidget selectedDate={selectedDate} />
            </Box>
          </Paper>
        </Box>
      </Paper>

      {/* 병원 지도 모달 */}
      <HospitalMapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        hospitals={recommendedHospital ? [recommendedHospital] : []} // 현재 선택된 병원만 전달
        currentPosition={currentPosition}
      />
    </Box>
  );
};

export default Home;