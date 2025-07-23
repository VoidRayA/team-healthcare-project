import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Chart, registerables } from 'chart.js/auto';
import { getVitalSignsByDate } from '../../api/apiClient';

// Chart.js 등록
Chart.register(...registerables);

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
  const [chartInstance, setChartInstance] = useState(null);
  const bloodPressureChartRef = useRef(null);
  const heartRateTemperatureChartRef = useRef(null);

  // 바이탈 데이터 필터링 및 정리 함수 (시간대별 그룹화)
  const processVitalData = (rawData, selectedDate) => {
    console.log('📊 processVitalData 시작:');
    console.log('   - rawData:', rawData);
    console.log('   - selectedDate:', selectedDate);

    if (!rawData || rawData.length === 0) {
      console.log('❌ 원본 데이터가 없음 - 빈 배열 반환');
      return [];
    }

    console.log(`📊 원본 데이터: ${rawData.length}건`);

    // 시간대별로 그룹화 (1시간 단위)
    const hourlyData = {};

    rawData.forEach(item => {
      const time = new Date(item.measurementTime);
      const hour = time.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = [];
      }
      hourlyData[hourKey].push(item);
    });

    // 각 시간대별 평균값 계산
    const processedData = Object.keys(hourlyData)
      .sort() // 시간순 정렬
      .map(hourKey => {
        const items = hourlyData[hourKey];
        const avgData = {
          measurementTime: `${getLocalDateString(selectedDate)}T${hourKey}:00`,
          bloodPressureHigh: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureHigh || 0), 0) / items.length),
          bloodPressureLow: Math.round(items.reduce((sum, item) => sum + (item.bloodPressureLow || 0), 0) / items.length),
          heartRate: Math.round(items.reduce((sum, item) => sum + (item.heartRate || 0), 0) / items.length),
          bodyTemperature: Number((items.reduce((sum, item) => sum + (item.bodyTemperature || 0), 0) / items.length).toFixed(1)),
          bloodSugar: Math.round(items.reduce((sum, item) => sum + (item.bloodSugar || 0), 0) / items.length),
          dataCount: items.length, // 해당 시간대 데이터 개수
          // 위험도 판정
          isEmergency: false,
          isWarning: false
        };

        // 위험/경고 수치 판정 (의료진 기준)
        avgData.isEmergency = (
          avgData.bloodPressureHigh >= 180 || avgData.bloodPressureHigh <= 90 ||
          avgData.bloodPressureLow >= 110 || avgData.bloodPressureLow <= 60 ||
          avgData.heartRate >= 100 || avgData.heartRate <= 50 ||
          avgData.bodyTemperature >= 38.0 || avgData.bodyTemperature <= 35.5 ||
          avgData.bloodSugar >= 250 || avgData.bloodSugar <= 70
        );

        avgData.isWarning = !avgData.isEmergency && (
          avgData.bloodPressureHigh >= 140 || avgData.bloodPressureHigh <= 100 ||
          avgData.bloodPressureLow >= 90 || avgData.bloodPressureLow <= 65 ||
          avgData.heartRate >= 90 || avgData.heartRate <= 60 ||
          avgData.bodyTemperature >= 37.5 || avgData.bodyTemperature <= 36.0 ||
          avgData.bloodSugar >= 180 || avgData.bloodSugar <= 80
        );
        
        return avgData;
      });
    
    console.log(`📈 처리된 데이터: ${processedData.length}개 시간대`);
    if (processedData.length > 0) {
      console.log('시간대별 요약:', processedData.map(d => `${d.measurementTime.split('T')[1].slice(0,5)}(${d.dataCount}건)`).join(', '));
    }
    
    return processedData;
  };

  // No Data 차트 생성 함수
  const createNoDataChart = (ctx, message, selectedDate) => {
    // 기존 차트가 있으면 제거
    const canvas = ctx.canvas;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
      console.log('기존 NoData 차트 제거 완료');
    }
    
    console.log(`📝 데이터 없음 차트 생성: ${message}`);
    
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['데이터 없음'],
        datasets: [{
          data: [1],
          backgroundColor: ['#f5f5f5'],
          borderColor: ['#e0e0e0'],
          borderWidth: 2,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        animation: { duration: 0 }
      },
      plugins: [{
        id: 'noDataText',
        afterDraw: function(chart) {
          const { ctx, chartArea } = chart;
          if (!ctx || !chartArea) return;
          
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // 메인 메시지
          ctx.font = 'bold 14px Pretendard, sans-serif';
          ctx.fillStyle = '#666';
          ctx.fillText('📊 데이터 없음', centerX, centerY - 15);
          
          // 서브 메시지
          ctx.font = '12px Pretendard, sans-serif';
          ctx.fillStyle = '#999';
          ctx.fillText(message, centerX, centerY + 5);
          
          // 날짜 정보
          const dateStr = selectedDate ? getLocalDateString(selectedDate) : '';
          if (dateStr) {
            ctx.font = '10px Pretendard, sans-serif';
            ctx.fillStyle = '#bbb';
            ctx.fillText(`(${dateStr})`, centerX, centerY + 20);
          }
          
          ctx.restore();
        }
      }]
    });
    
    console.log('✅ NoData 차트 생성 완료:', !!chart);
    return chart;
  };

  // 혈압 차트 생성 함수
  const createBloodPressureChart = (processedData, selectedDate, selectedSenior) => {
    if (!bloodPressureChartRef.current) {
      console.warn('혈압 차트 Canvas ref가 없습니다');
      return null;
    }
    
    const ctx = bloodPressureChartRef.current.getContext('2d');
    
    // 기존 차트 정리
    const existingChart = Chart.getChart(bloodPressureChartRef.current);
    if (existingChart) {
      existingChart.destroy();
      console.log('기존 혈압 차트 제거 완료');
    }
    
    if (!processedData || processedData.length === 0) {
      console.log('혈압 데이터가 없어서 NoData 차트 생성');
      return createNoDataChart(ctx, '혈압 데이터가 없습니다', selectedDate);
    }
    
    const labels = processedData.map(item => {
      const time = new Date(item.measurementTime);
      return time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    });
    
    const pointColors = processedData.map(point => {
      if (point.isEmergency) return '#ff1744';
      if (point.isWarning) return '#ff9800';
      return '#4caf50';
    });
    
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '수축기 혈압',
            data: processedData.map(item => item.bloodPressureHigh),
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: pointColors,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: false
          },
          {
            label: '이완기 혈압',
            data: processedData.map(item => item.bloodPressureLow),
            borderColor: '#ffa8a8',
            backgroundColor: 'rgba(255, 168, 168, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: pointColors,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 10 }, padding: 10 }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const dataIndex = context[0].dataIndex;
                const pointData = processedData[dataIndex];
                const status = pointData.isEmergency ? '🚨 위험' : pointData.isWarning ? '⚠️ 경고' : '✅ 정상';
                return `${context[0].label} ${status}`;
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} mmHg`;
              }
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'mmHg', font: { size: 11 } },
            min: 60,
            max: 200,
            ticks: { font: { size: 9 } }
          },
          x: {
            ticks: { font: { size: 9 } }
          }
        },
        animation: { 
          duration: 0,
          resize: { duration: 0 }
        }
      }
    });
  };

  // 심박수 + 체온 차트 생성 함수
  const createHeartRateTemperatureChart = (processedData, selectedDate, selectedSenior) => {
    if (!heartRateTemperatureChartRef.current) {
      console.warn('❌ 심박수+체온 차트 Canvas ref가 없습니다');
      return null;
    }
    
    console.log('💓 심박수+체온 차트 생성 시작');
    
    const ctx = heartRateTemperatureChartRef.current.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas 2D Context를 가져올 수 없습니다');
      return null;
    }
    
    // 기존 차트 정리
    const existingChart = Chart.getChart(heartRateTemperatureChartRef.current);
    if (existingChart) {
      console.log('🗑️ 기존 심박수+체온 차트 제거');
      existingChart.destroy();
    }
    
    if (!processedData || processedData.length === 0) {
      console.log('📝 심박수+체온 데이터가 없어서 NoData 차트 생성');
      return createNoDataChart(ctx, '심박수 & 체온 데이터가 없습니다', selectedDate);
    }
    
    console.log(`📊 심박수+체온 차트 데이터 처리: ${processedData.length}개 시간대`);
    
    const labels = processedData.map(item => {
      const time = new Date(item.measurementTime);
      return time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    });
    
    const pointColors = processedData.map(point => {
      if (point.isEmergency) return '#ff1744';
      if (point.isWarning) return '#ff9800';
      return '#4caf50';
    });
    
    console.log('📈 심박수+체온 차트 Chart.js 인스턴스 생성');
    
    try {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '심박수',
              data: processedData.map(item => item.heartRate),
              borderColor: '#4dabf7',
              backgroundColor: 'rgba(77, 171, 247, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              tension: 0.4,
              yAxisID: 'heartRate',
              fill: false
            },
            {
              label: '체온',
              data: processedData.map(item => item.bodyTemperature),
              borderColor: '#69db7c',
              backgroundColor: 'rgba(105, 219, 124, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: pointColors,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              tension: 0.4,
              yAxisID: 'temperature',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 0,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { size: 10 }, padding: 10 }
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  const dataIndex = context[0].dataIndex;
                  const pointData = processedData[dataIndex];
                  const status = pointData.isEmergency ? '🚨 위험' : pointData.isWarning ? '⚠️ 경고' : '✅ 정상';
                  return `${context[0].label} ${status}`;
                },
                label: function(context) {
                  const unit = context.datasetIndex === 0 ? ' bpm' : ' °C';
                  return `${context.dataset.label}: ${context.parsed.y}${unit}`;
                }
              }
            }
          },
          scales: {
            heartRate: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'bpm', color: '#4dabf7', font: { size: 11 } },
              min: 40,
              max: 120,
              ticks: { font: { size: 9 }, color: '#4dabf7' }
            },
            temperature: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: '°C', color: '#69db7c', font: { size: 11 } },
              min: 35,
              max: 40,
              ticks: { font: { size: 9 }, color: '#69db7c' }
            },
            x: {
              ticks: { font: { size: 9 } }
            }
          },
          animation: { 
            duration: 0,
            resize: { duration: 0 }
          }
        }
      });
      
      console.log('✅ 심박수+체온 차트 생성 완료');
      return chart;
      
    } catch (error) {
      console.error('❌ 심박수+체온 차트 생성 오류:', error);
      return createNoDataChart(ctx, '차트 생성 오류', selectedDate);
    }
  };

  // 차트 업데이트 함수
  const updateVitalChart = (data, selectedDate, selectedSenior) => {
    console.log('📈 차트 업데이트 시작');
    console.log('   - 원본 데이터:', data?.length || 0, '건');
    console.log('   - 선택된 날짜:', selectedDate);
    console.log('   - 선택된 Senior:', selectedSenior?.seniorName);
    
    try {
      // 데이터 처리 (시간대별 그룹화)
      const processedData = processVitalData(data, selectedDate);
      console.log('   - 처리된 데이터:', processedData?.length || 0, '개 시간대');
      
      // 1. 혈압 차트 생성
      console.log('🩸 혈압 차트 생성...');
      const bloodPressureChart = createBloodPressureChart(processedData, selectedDate, selectedSenior);
      
      // 2. 심박수 + 체온 차트 생성
      console.log('💓 심박수+체온 차트 생성...');
      const heartRateTemperatureChart = createHeartRateTemperatureChart(processedData, selectedDate, selectedSenior);
      
      // 차트 인스턴스 저장
      setChartInstance({
        bloodPressureChart,
        heartRateTemperatureChart
      });
      
      console.log('✅ 차트 업데이트 완료!');
      console.log(`🩸 혈압: ${!!bloodPressureChart}`);
      console.log(`💓 심박수+체온: ${!!heartRateTemperatureChart}`);
      
    } catch (error) {
      console.error('❌ 차트 업데이트 오류:', error);
    }
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
        updateVitalChart(vitalData, selectedDate, selectedSenior);
      } else {
        console.log('📝 해당 날짜에 데이터가 없습니다.');
        setVitalSignsData([]);
        updateVitalChart([], selectedDate, selectedSenior);
      }
      
    } catch (error) {
      console.error('바이탈 사인 데이터 로드 오류:', error);
      
      if (error.response?.status === 404) {
        console.log('📝 해당 Senior의 바이탈 데이터가 없습니다.');
      } else {
        console.error('😨 API 호출 오류:', error.message);
      }
      
      setVitalSignsData([]);
      updateVitalChart([], selectedDate, selectedSenior);
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
      console.log('🚫 조건 미충족 - 차트 초기화');
      setVitalSignsData([]);
      
      const timeout = setTimeout(() => {
        updateVitalChart([], selectedDate, selectedSenior);
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [selectedDate, selectedSenior]);

  // cleanup: 컴포넌트 언마운트 시 차트 인스턴스 정리
  useEffect(() => {
    return () => {
      if (chartInstance) {
        if (chartInstance.bloodPressureChart) {
          chartInstance.bloodPressureChart.destroy();
          console.log('혈압 차트 인스턴스 정리 완료');
        }
        if (chartInstance.heartRateTemperatureChart) {
          chartInstance.heartRateTemperatureChart.destroy();
          console.log('심박수+체온 차트 인스턴스 정리 완료');
        }
      }
    };
  }, [chartInstance]);

  return (
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
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        💓 오늘의 바이탈 사인
      </Typography>
      
      {vitalSignsLoading ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '380px',
          gap: 2
        }}>
          <Typography sx={{
            color: '#666',
            fontFamily: 'Pretendard'
          }}>
            데이터를 불러오는 중...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {/* 혈압 차트 */}
          <Box sx={{
            flex: 1,
            minHeight: '200px',
            maxHeight: '220px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ff6b6b', fontSize: '1rem' }}>
              🩸 혈압 (mmHg)
            </Typography>
            <Box sx={{ 
              height: 'calc(100% - 35px)', 
              position: 'relative'
            }}>
              <canvas 
                ref={bloodPressureChartRef}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </Box>
          </Box>
          
          {/* 심박수 + 체온 차트 */}
          <Box sx={{
            flex: 1,
            minHeight: '200px',
            maxHeight: '220px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#4dabf7', fontSize: '1rem' }}>
              💓 심박수 & 🌡️ 체온
            </Typography>
            <Box sx={{ 
              height: 'calc(100% - 35px)', 
              position: 'relative'
            }}>
              <canvas 
                ref={heartRateTemperatureChartRef}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
      
      {/* 바이탈 사인 요약 정보 */}
      {vitalSignsData.length > 0 ? (
        <Box sx={{
          marginTop: 2,
          padding: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1
        }}>
          <Typography variant="caption" sx={{
            color: '#666',
            fontFamily: 'Pretendard',
            fontSize: '12px',
            display: 'block',
            textAlign: 'center'
          }}>
            총 {vitalSignsData.length}건의 측정 데이터 (오늘)
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
      ) : (
        <Box sx={{
          marginTop: 2,
          padding: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          border: '1px dashed #ddd'
        }}>
          <Typography variant="caption" sx={{
            color: '#999',
            fontFamily: 'Pretendard',
            fontSize: '12px',
            display: 'block',
            textAlign: 'center'
          }}>
            해당 날짜에 측정된 데이터가 없습니다
          </Typography>
          <Typography variant="caption" sx={{
            color: '#bbb',
            fontFamily: 'Pretendard',
            fontSize: '11px',
            display: 'block',
            textAlign: 'center',
            marginTop: 0.5
          }}>
            다른 날짜를 선택하여 데이터를 확인해보세요
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VitalSignsChart;