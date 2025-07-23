import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, TrendingUp, Warning, CheckCircle } from '@mui/icons-material';
import { Chart, registerables } from 'chart.js/auto';
import { getVitalSignsByDate } from '../../api/apiClient';
import { getAuthToken as getToken } from '../../utils/auth';

// Chart.js 등록
Chart.register(...registerables);

// 로컬 시간대 기준 날짜 문자열 생성 함수
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const VitalSignsDetailModal = ({
  open,
  onClose,
  selectedSenior,
  selectedDate
}) => {
  // State 관리
  const [loading, setLoading] = useState(false);
  const [vitalData, setVitalData] = useState([]);
  const [chartInstances, setChartInstances] = useState({});
  const [userSettings, setUserSettings] = useState(null);

  // Chart refs
  const mainChartRef = useRef(null);
  const summaryChartRef = useRef(null);

  // 사용자 모니터링 설정 조회
  const fetchUserSettings = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/monitoring-settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserSettings(data);
      } else {
        console.warn('사용자 설정을 불러올 수 없어 기본값을 사용합니다.');
      }
    } catch (error) {
      console.error('사용자 설정 조회 오류:', error);
    }
  };

  // 상태 분석 함수 (사용자 설정 기준 적용)
  const analyzeVitalStatus = (data) => {
    if (!data || data.length === 0) return { status: 'no-data', message: '데이터 없음' };

    let attentionCount = 0;
    let cautionCount = 0;
    let normalCount = 0;

    // 기본값 (사용자 설정이 없을 때)
    const defaultSettings = {
      bloodPressureAttentionMax: 180,
      bloodPressureAttentionMin: 90,
      bloodPressureCautionMax: 140,
      bloodPressureCautionMin: 100,
      diastolicAttentionMax: 110,
      diastolicAttentionMin: 60,
      diastolicCautionMax: 90,
      diastolicCautionMin: 65,
      heartRateAttentionMax: 100,
      heartRateAttentionMin: 50,
      heartRateCautionMax: 90,
      heartRateCautionMin: 60,
      bodyTemperatureAttentionMax: 38.0,
      bodyTemperatureAttentionMin: 35.5,
      bodyTemperatureCautionMax: 37.5,
      bodyTemperatureCautionMin: 36.0,
      bloodSugarAttentionMax: 250,
      bloodSugarAttentionMin: 70,
      bloodSugarCautionMax: 180,
      bloodSugarCautionMin: 80
    };

    const settings = userSettings || defaultSettings;

    data.forEach(item => {
      let isAttention = false;
      let isCaution = false;

      // 수축기 혈압 판정
      if (item.bloodPressureHigh !== null) {
        if (item.bloodPressureHigh >= settings.bloodPressureAttentionMax || 
            item.bloodPressureHigh <= settings.bloodPressureAttentionMin) {
          isAttention = true;
        } else if (item.bloodPressureHigh >= settings.bloodPressureCautionMax || 
                   item.bloodPressureHigh <= settings.bloodPressureCautionMin) {
          isCaution = true;
        }
      }

      // 이완기 혈압 판정
      if (item.bloodPressureLow !== null) {
        if (item.bloodPressureLow >= settings.diastolicAttentionMax || 
            item.bloodPressureLow <= settings.diastolicAttentionMin) {
          isAttention = true;
        } else if (item.bloodPressureLow >= settings.diastolicCautionMax || 
                   item.bloodPressureLow <= settings.diastolicCautionMin) {
          isCaution = true;
        }
      }

      // 심박수 판정
      if (item.heartRate !== null) {
        if (item.heartRate >= settings.heartRateAttentionMax || 
            item.heartRate <= settings.heartRateAttentionMin) {
          isAttention = true;
        } else if (item.heartRate >= settings.heartRateCautionMax || 
                   item.heartRate <= settings.heartRateCautionMin) {
          isCaution = true;
        }
      }

      // 체온 판정 (사용자 설정 적용)
      if (item.bodyTemperature !== null) {
        if (item.bodyTemperature >= settings.bodyTemperatureAttentionMax ||
            item.bodyTemperature <= settings.bodyTemperatureAttentionMin) {
          isAttention = true;
        } else if (item.bodyTemperature >= settings.bodyTemperatureCautionMax ||
                   item.bodyTemperature <= settings.bodyTemperatureCautionMin) {
          isCaution = true;
        }
      }

      // 혈당 판정 (사용자 설정 적용)
      if (item.bloodSugar !== null) {
        if (item.bloodSugar >= settings.bloodSugarAttentionMax ||
            item.bloodSugar <= settings.bloodSugarAttentionMin) {
          isAttention = true;
        } else if (item.bloodSugar >= settings.bloodSugarCautionMax ||
                   item.bloodSugar <= settings.bloodSugarCautionMin) {
          isCaution = true;
        }
      }

      if (isAttention) {
        attentionCount++;
      } else if (isCaution) {
        cautionCount++;
      } else {
        normalCount++;
      }
    });

    const total = data.length;
    const attentionRatio = attentionCount / total;
    const cautionRatio = cautionCount / total;

    if (attentionRatio > 0.1) { // 10% 이상 주의
      return { 
        status: 'attention', 
        message: '의료진 상담 권장',
        counts: { attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    } else if (attentionRatio > 0 || cautionRatio > 0.3) { // 주의가 있거나 30% 이상 관찰
      return { 
        status: 'caution', 
        message: '계속 관찰 필요',
        counts: { attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    } else {
      return { 
        status: 'normal', 
        message: '안정적 상태',
        counts: { attention: attentionCount, caution: cautionCount, normal: normalCount }
      };
    }
  };

  // 24시간 기준 데이터 처리 함수
  const processVitalDataFor24Hours = (rawData) => {
    // 24시간 전체 시간대 생성 (00:00 ~ 23:00)
    const allHours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return {
        time: `${hour}:00`,
        hour: i,
        hasData: false,
        bloodPressureHigh: null,
        bloodPressureLow: null,
        heartRate: null,
        bodyTemperature: null,
        bloodSugar: null,
        dataCount: 0
      };
    });

    if (!rawData || rawData.length === 0) {
      return {
        processedData: allHours,
        lastMeasurementHour: -1
      };
    }

    // 실제 데이터를 시간대별로 그룹화
    const hourlyData = {};
    let lastMeasurementHour = -1;

    rawData.forEach(item => {
      const time = new Date(item.measurementTime);
      const hour = time.getHours();
      lastMeasurementHour = Math.max(lastMeasurementHour, hour);
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(item);
    });

    // 실제 데이터가 있는 시간대에 평균값 계산
    Object.keys(hourlyData).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const items = hourlyData[hour];
      
      allHours[hour] = {
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour,
        hasData: true,
        bloodPressureHigh: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureHigh || 0), 0) / items.length),
        bloodPressureLow: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureLow || 0), 0) / items.length),
        heartRate: Math.round(items.reduce((sum, item) => sum + (item.heartRate || 0), 0) / items.length),
        bodyTemperature: Number((items.reduce((sum, item) => sum + (item.bodyTemperature || 0), 0) / items.length).toFixed(1)),
        bloodSugar: Math.round(items.reduce((sum, item) => sum + (item.bloodSugar || 0), 0) / items.length),
        dataCount: items.length
      };
    });

    console.log(`🕰️ 24시간 처리 완료: 마지막 측정 ${lastMeasurementHour}:00`);
    
    return {
      processedData: allHours,
      lastMeasurementHour: lastMeasurementHour
    };
  };

  // 메인 차트 생성 (24시간 기준)
  const createMainChart = (processedData, lastMeasurementHour) => {
    if (!mainChartRef.current) return;

    const ctx = mainChartRef.current.getContext('2d');
    
    // 기존 차트 제거
    const existingChart = Chart.getChart(mainChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    // 실제 데이터가 있는 부분과 빈 부분 분리
    const actualData = processedData.filter(item => item.hasData);
    const allLabels = processedData.map(item => item.time);
    
    // 데이터셋 생성
    const datasets = [];
    
    if (actualData.length > 0) {
      // 실제 데이터 라인 (전체 24시간 기준으로)
      const bloodPressureHighData = processedData.map(item => item.hasData ? item.bloodPressureHigh : null);
      const bloodPressureLowData = processedData.map(item => item.hasData ? item.bloodPressureLow : null);
      const heartRateData = processedData.map(item => item.hasData ? item.heartRate : null);
      const temperatureData = processedData.map(item => item.hasData ? item.bodyTemperature : null);
      
      datasets.push(
        {
          label: '수축기 혈압 (mmHg)',
          data: bloodPressureHighData,
          borderColor: '#ff4444',
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'blood-pressure',
          spanGaps: false // null 값에서 라인 끊김
        },
        {
          label: '이완기 혈압 (mmHg)',
          data: bloodPressureLowData,
          borderColor: '#ff7777',
          backgroundColor: 'rgba(255, 119, 119, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          yAxisID: 'blood-pressure',
          spanGaps: false
        },
        {
          label: '심박수 (bpm)',
          data: heartRateData,
          borderColor: '#4dabf7',
          backgroundColor: 'rgba(77, 171, 247, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'heart-rate',
          spanGaps: false
        },
        {
          label: '체온 (°C)',
          data: temperatureData,
          borderColor: '#69db7c',
          backgroundColor: 'rgba(105, 219, 124, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          yAxisID: 'temperature',
          spanGaps: false
        }
      );
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${selectedSenior?.seniorName || '보호 대상자'}님의 24시간 바이탈 사인 ${lastMeasurementHour >= 0 ? `(마지막 측정: ${lastMeasurementHour}:00)` : ''}`,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20 }
          },
          tooltip: {
            filter: function(tooltipItem) {
              // 데이터가 있는 경우만 툴팁 표시
              const dataIndex = tooltipItem.dataIndex;
              return processedData[dataIndex].hasData;
            },
            callbacks: {
              title: function(context) {
                const dataIndex = context[0].dataIndex;
                const data = processedData[dataIndex];
                return data.hasData ? `${context[0].label} (${data.dataCount}건 측정)` : '데이터 없음';
              }
            }
          }
        },
        scales: {
          'blood-pressure': {
            type: 'linear',
            position: 'left',
            title: { display: true, text: '혈압 (mmHg)', color: '#ff4444' },
            min: 60,
            max: 200,
            grid: { color: 'rgba(255, 68, 68, 0.1)' }
          },
          'heart-rate': {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '심박수 (bpm)', color: '#4dabf7' },
            min: 50,
            max: 120,
            grid: { display: false }
          },
          'temperature': {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '체온 (°C)', color: '#69db7c' },
            min: 35,
            max: 40,
            grid: { display: false }
          },
          x: {
            title: { display: true, text: '시간 (24시간 기준)' },
            grid: {
              color: function(context) {
                const hour = context.tick.value;
                // 데이터가 있는 구간은 진한 선, 없는 구간은 연한 점선
                return hour <= lastMeasurementHour ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)';
              }
            },
            ticks: {
              color: function(context) {
                const hour = context.tick.value;
                // 데이터가 있는 구간은 진한 색, 없는 구간은 연한 색
                return hour <= lastMeasurementHour ? '#333' : '#ccc';
              }
            }
          }
        }
      }
    });

    setChartInstances(prev => ({ ...prev, mainChart: chart }));
  };

  // 상태 요약 차트 생성 (도넛 차트)
  const createSummaryChart = (statusAnalysis) => {
    if (!summaryChartRef.current || !statusAnalysis.counts) return;

    const ctx = summaryChartRef.current.getContext('2d');
    
    // 기존 차트 제거
    const existingChart = Chart.getChart(summaryChartRef.current);
    if (existingChart) {
      existingChart.destroy();
    }

    const { attention, caution, normal } = statusAnalysis.counts;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['주의', '관찰', '안정'],
        datasets: [{
          data: [attention, caution, normal],
          backgroundColor: ['#ff9800', '#ffc107', '#4caf50'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '측정값 분포',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    setChartInstances(prev => ({ ...prev, summaryChart: chart }));
  };

  // 데이터 로드
  const loadDetailData = async () => {
    if (!selectedSenior?.id || !selectedDate) return;

    try {
      setLoading(true);
      const dateString = getLocalDateString(selectedDate);
      const data = await getVitalSignsByDate(selectedSenior.id, dateString);
      
      setVitalData(data || []);
      
      // 차트 생성
      setTimeout(() => {
        const result = processVitalDataFor24Hours(data);
        const { processedData, lastMeasurementHour } = result;
        const statusAnalysis = analyzeVitalStatus(data);
        
        createMainChart(processedData, lastMeasurementHour);
        createSummaryChart(statusAnalysis);
      }, 100);
      
    } catch (error) {
      console.error('상세 바이탈 데이터 로드 오류:', error);
      setVitalData([]);
    } finally {
      setLoading(false);
    }
  };

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (open) {
      fetchUserSettings(); // 사용자 설정 먼저 조회
      loadDetailData();
    }
  }, [open, selectedSenior, selectedDate]);

  // 차트 정리
  useEffect(() => {
    return () => {
      Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  const statusAnalysis = analyzeVitalStatus(vitalData);
  const result = processVitalDataFor24Hours(vitalData);
  const { processedData } = result;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        height: '80px' // 고정 높이
      }}>
        <Box>
          <Typography variant="h5" component="div" fontWeight="bold">
            💓 바이탈 사인 상세 분석
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {selectedSenior?.seniorName || '보호 대상자'}님 • {getLocalDateString(selectedDate)}
          </Typography>
        </Box>
        
        {/* 상태 표시 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          />
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, height: 'calc(90vh - 120px)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={60} />
            <Typography sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 상단: 메인 차트 (70% 높이) */}
            <Box sx={{ height: '70%', mb: 2 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <canvas ref={mainChartRef} style={{ width: '100%', height: '100%' }} />
              </Paper>
            </Box>

            {/* 하단: 요약 정보들 (30% 높이) */}
            <Box sx={{ height: '30%', display: 'flex', gap: 2 }}>
              {/* 왼쪽: 상태 도넛 차트 */}
              <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>📊 측정 분포</Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <canvas ref={summaryChartRef} style={{ width: '100%', height: '100%' }} />
                </Box>
              </Paper>

              {/* 가운데: 통계 정보 */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>📈 측정 통계</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, height: 'calc(100% - 30px)' }}>
                  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">총 측정</Typography>
                    <Typography variant="h6" fontWeight="bold">{vitalData.length}건</Typography>
                  </Box>
                  {statusAnalysis.counts && (
                    <>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                        <Typography variant="caption" color="error">위험</Typography>
                        <Typography variant="h6" fontWeight="bold" color="error">{statusAnalysis.counts.danger}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                        <Typography variant="caption" color="warning.main">주의</Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">{statusAnalysis.counts.warning}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                        <Typography variant="caption" color="success.main">정상</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">{statusAnalysis.counts.normal}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>

              {/* 오른쪽: 권장사항 */}
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>💡 권장사항</Typography>
                <Box sx={{ 
                  height: 'calc(100% - 30px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {statusAnalysis.status === 'attention' 
                      ? '⚠️ 수치를 확인해주세요. 의료진과 상담을 권장합니다.'
                      : statusAnalysis.status === 'caution'
                      ? '📈 일부 수치를 계속 관찰해주세요. 규칙적인 측정을 추천합니다.'
                      : '✅ 대부분 안정적인 상태입니다. 현재 관리 방법을 유지하세요.'
                    }
                  </Typography>
                  
                  {processedData.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        시간대: {processedData.length}개 구간 측정
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VitalSignsDetailModal;
