import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, Grid } from '@mui/material';
import { TrendingUp, Warning, CheckCircle, Visibility } from '@mui/icons-material';
import { getVitalSignsByDate } from '../../api/apiClient';
import VitalSignsDetailModal from '../modals/VitalSignsDetailModal';

// 로컬 시간대 기준 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const VitalSignsChart = ({ 
  selectedSenior, 
  selectedDate 
}) => {
  const [vitalSignsData, setVitalSignsData] = useState([]);
  const [vitalSignsLoading, setVitalSignsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 최신 측정값 계산
  const getLatestVitals = (data) => {
    if (!data || data.length === 0) return null;
    
    // 가장 최근 측정값
    const latest = data[data.length - 1];
    return {
      bloodPressure: `${latest.bloodPressureHigh}/${latest.bloodPressureLow}`,
      heartRate: latest.heartRate,
      bodyTemperature: latest.bodyTemperature?.toFixed(1),
      bloodSugar: latest.bloodSugar,
      measurementTime: new Date(latest.measurementTime).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // 상태 분석 (간단 버전)
  const analyzeStatus = (data) => {
    if (!data || data.length === 0) return { status: 'no-data', message: '데이터 없음' };

    const latest = data[data.length - 1];
    
    // 위험 수치 판정
    if (latest.bloodPressureHigh >= 180 || latest.bloodPressureHigh <= 90 ||
        latest.bloodPressureLow >= 110 || latest.bloodPressureLow <= 60 ||
        latest.heartRate >= 100 || latest.heartRate <= 50 ||
        latest.bodyTemperature >= 38.0 || latest.bodyTemperature <= 35.5 ||
        latest.bloodSugar >= 250 || latest.bloodSugar <= 70) {
      return { status: 'danger', message: '즉시 확인 필요' };
    }
    
    // 경고 수치 판정
    if (latest.bloodPressureHigh >= 140 || latest.bloodPressureHigh <= 100 ||
        latest.bloodPressureLow >= 90 || latest.bloodPressureLow <= 65 ||
        latest.heartRate >= 90 || latest.heartRate <= 60 ||
        latest.bodyTemperature >= 37.5 || latest.bodyTemperature <= 36.0 ||
        latest.bloodSugar >= 180 || latest.bloodSugar <= 80) {
      return { status: 'warning', message: '주의 관찰' };
    }
    
    return { status: 'normal', message: '정상 범위' };
  };

  // 바이탈 사인 데이터 로드
  const loadVitalSignsData = async (seniorId, date = null) => {
    try {
      setVitalSignsLoading(true);
      
      const targetDate = date || getLocalDateString(new Date());
      console.log(`💓 바이탈 사인 데이터 로드 시작:`);
      console.log(`   - Senior ID: ${seniorId}`);
      console.log(`   - Senior 이름: ${selectedSenior?.seniorName || '알 수 없음'}`);
      console.log(`   - 날짜: ${targetDate}`);
      
      const vitalData = await getVitalSignsByDate(seniorId, targetDate);
      console.log('바이탈 사인 API 성공:', vitalData);
      
      if (vitalData && vitalData.length > 0) {
        console.log(`✅ 실제 API 데이터 사용: ${vitalData.length}건`);
        setVitalSignsData(vitalData);
      } else {
        console.log('📝 해당 날짜에 데이터가 없습니다.');
        setVitalSignsData([]);
      }
      
    } catch (error) {
      console.error('바이탈 사인 데이터 로드 오류:', error);
      
      if (error.response?.status === 404) {
        console.log('📝 해당 Senior의 바이탈 데이터가 없습니다.');
      } else {
        console.error('😨 API 호출 오류:', error.message);
      }
      
      setVitalSignsData([]);
    } finally {
      setVitalSignsLoading(false);
    }
  };

  // selectedDate 또는 selectedSenior가 변경될 때마다 데이터 로드
  useEffect(() => {
    console.log('🔄 VitalSignsChart useEffect 트리거됨!');
    console.log('   - selectedSenior:', selectedSenior?.seniorName);
    console.log('   - selectedDate:', selectedDate);
    
    if (selectedSenior && selectedSenior.id && selectedDate) {
      const dateString = getLocalDateString(selectedDate);
      console.log(`🔄 바이탈 데이터 로드 시작: ${dateString}`);
      
      const timeout = setTimeout(() => {
        loadVitalSignsData(selectedSenior.id, dateString);
      }, 10);
      
      return () => clearTimeout(timeout);
    } else {
      console.log('🚫 조건 미충족 - 데이터 초기화');
      setVitalSignsData([]);
    }
  }, [selectedDate, selectedSenior]);

  const latestVitals = getLatestVitals(vitalSignsData);
  const statusAnalysis = analyzeStatus(vitalSignsData);

  return (
    <>
      <Paper sx={{
        backgroundColor: '#ffffff',
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        padding: 2.5,
        minHeight: '450px',
        overflow: 'auto',
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            💓 오늘의 바이탈 사인
          </Typography>
          
          {vitalSignsData.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => setShowDetailModal(true)}
              sx={{ fontSize: '0.8rem' }}
            >
              상세보기
            </Button>
          )}
        </Box>
        
        {vitalSignsLoading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '350px',
            gap: 2
          }}>
            <Typography sx={{ color: '#666', fontFamily: 'Pretendard' }}>
              데이터를 불러오는 중...
            </Typography>
          </Box>
        ) : vitalSignsData.length > 0 && latestVitals ? (
          <Box sx={{ flex: 1 }}>
            {/* 상태 표시 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Chip
              icon={
              statusAnalysis.status === 'attention' ? <Warning /> :
              statusAnalysis.status === 'caution' ? <TrendingUp /> :
              <CheckCircle />
              }
              label={statusAnalysis.message}
              color={
              statusAnalysis.status === 'attention' ? 'warning' :
              statusAnalysis.status === 'caution' ? 'info' :
              'success'
              }
              variant="filled"
              sx={{ fontSize: '1rem', py: 2, px: 1 }}
              />
            </Box>

            {/* 최신 측정값 */}
            <Grid container spacing={2}>
              {/* 혈압 */}
              <Grid item xs={6}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    🩸 혈압
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {latestVitals.bloodPressure}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    mmHg
                  </Typography>
                </Paper>
              </Grid>

              {/* 심박수 */}
              <Grid item xs={6}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    💓 심박수
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {latestVitals.heartRate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    bpm
                  </Typography>
                </Paper>
              </Grid>

              {/* 체온 */}
              <Grid item xs={6}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    🌡️ 체온
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {latestVitals.bodyTemperature}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    °C
                  </Typography>
                </Paper>
              </Grid>

              {/* 혈당 */}
              <Grid item xs={6}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    🍯 혈당
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {latestVitals.bloodSugar}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    mg/dL
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* 측정 시간 및 통계 */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" sx={{
                color: '#666',
                fontFamily: 'Pretendard',
                fontSize: '12px',
                display: 'block',
                textAlign: 'center'
              }}>
                최근 측정: {latestVitals.measurementTime} • 총 {vitalSignsData.length}건
              </Typography>
              {selectedSenior && (
                <Typography variant="caption" sx={{
                  color: '#1976d2',
                  fontFamily: 'Pretendard',
                  fontSize: '11px',
                  display: 'block',
                  textAlign: 'center',
                  marginTop: 0.5
                }}>
                  {selectedSenior.seniorName || '보호 대상자'}님의 건강 데이터
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '350px',
            gap: 2
          }}>
            <Typography sx={{
              color: '#999',
              fontFamily: 'Pretendard',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              📊 해당 날짜에 측정된 데이터가 없습니다
            </Typography>
            <Typography sx={{
              color: '#bbb',
              fontFamily: 'Pretendard',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              다른 날짜를 선택하여 데이터를 확인해보세요
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 상세보기 모달 */}
      <VitalSignsDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        selectedSenior={selectedSenior}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default VitalSignsChart;
