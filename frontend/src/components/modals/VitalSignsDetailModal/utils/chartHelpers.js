// 기준선 annotation 생성 함수
export const createThresholdAnnotations = (settings, thresholdLines) => {
  const annotations = {};
  
  console.log('🔧 기준선 생성 시작 - settings:', settings);
  console.log('🔧 기준선 체크 상태:', thresholdLines);
  
  // 혈압 기준선
  if (thresholdLines.bloodPressureAttentionMax) {
    console.log('✅ 혈압 위험 상한선 생성:', settings.bloodPressureAttentionMax);
    annotations.bpAttentionMax = {
      type: 'line',
      yMin: settings.bloodPressureAttentionMax,
      yMax: settings.bloodPressureAttentionMax,
      yScaleID: 'blood-pressure',
      borderColor: '#ff4444',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `위험 ${settings.bloodPressureAttentionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 68, 68, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodPressureAttentionMin) {
    annotations.bpAttentionMin = {
      type: 'line',
      yMin: settings.bloodPressureAttentionMin,
      yMax: settings.bloodPressureAttentionMin,
      yScaleID: 'blood-pressure',
      borderColor: '#ff4444',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `위험 ${settings.bloodPressureAttentionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 68, 68, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodPressureCautionMax) {
    annotations.bpCautionMax = {
      type: 'line',
      yMin: settings.bloodPressureCautionMax,
      yMax: settings.bloodPressureCautionMax,
      yScaleID: 'blood-pressure',
      borderColor: '#ffc107',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `주의 ${settings.bloodPressureCautionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodPressureCautionMin) {
    annotations.bpCautionMin = {
      type: 'line',
      yMin: settings.bloodPressureCautionMin,
      yMax: settings.bloodPressureCautionMin,
      yScaleID: 'blood-pressure',
      borderColor: '#ffc107',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `주의 ${settings.bloodPressureCautionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  // 이완기 혈압 기준선
  if (thresholdLines.diastolicAttentionMax) {
    annotations.diastolicAttentionMax = {
      type: 'line',
      yMin: settings.diastolicAttentionMax,
      yMax: settings.diastolicAttentionMax,
      yScaleID: 'blood-pressure',
      borderColor: '#ff6b6b',
      borderWidth: 1.5,
      borderDash: [8, 3],
      label: {
        content: `이완기위험 ${settings.diastolicAttentionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        color: 'white',
        font: { size: 9 }
      }
    };
  }
  
  if (thresholdLines.diastolicAttentionMin) {
    annotations.diastolicAttentionMin = {
      type: 'line',
      yMin: settings.diastolicAttentionMin,
      yMax: settings.diastolicAttentionMin,
      yScaleID: 'blood-pressure',
      borderColor: '#ff6b6b',
      borderWidth: 1.5,
      borderDash: [8, 3],
      label: {
        content: `이완기위험 ${settings.diastolicAttentionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        color: 'white',
        font: { size: 9 }
      }
    };
  }
  
  if (thresholdLines.diastolicCautionMax) {
    annotations.diastolicCautionMax = {
      type: 'line',
      yMin: settings.diastolicCautionMax,
      yMax: settings.diastolicCautionMax,
      yScaleID: 'blood-pressure',
      borderColor: '#ffeb3b',
      borderWidth: 1.5,
      borderDash: [5, 2],
      label: {
        content: `이완기주의 ${settings.diastolicCautionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 235, 59, 0.8)',
        color: 'black',
        font: { size: 9 }
      }
    };
  }
  
  if (thresholdLines.diastolicCautionMin) {
    annotations.diastolicCautionMin = {
      type: 'line',
      yMin: settings.diastolicCautionMin,
      yMax: settings.diastolicCautionMin,
      yScaleID: 'blood-pressure',
      borderColor: '#ffeb3b',
      borderWidth: 1.5,
      borderDash: [5, 2],
      label: {
        content: `이완기주의 ${settings.diastolicCautionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 235, 59, 0.8)',
        color: 'black',
        font: { size: 9 }
      }
    };
  }
  
  // 심박수 기준선
  if (thresholdLines.heartRateAttentionMax) {
    annotations.hrAttentionMax = {
      type: 'line',
      yMin: settings.heartRateAttentionMax,
      yMax: settings.heartRateAttentionMax,
      yScaleID: 'heart-rate',
      borderColor: '#e91e63',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `심박수위험 ${settings.heartRateAttentionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(233, 30, 99, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.heartRateAttentionMin) {
    annotations.hrAttentionMin = {
      type: 'line',
      yMin: settings.heartRateAttentionMin,
      yMax: settings.heartRateAttentionMin,
      yScaleID: 'heart-rate',
      borderColor: '#e91e63',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `심박수위험 ${settings.heartRateAttentionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(233, 30, 99, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.heartRateCautionMax) {
    annotations.hrCautionMax = {
      type: 'line',
      yMin: settings.heartRateCautionMax,
      yMax: settings.heartRateCautionMax,
      yScaleID: 'heart-rate',
      borderColor: '#ff9800',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `심박수주의 ${settings.heartRateCautionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 152, 0, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.heartRateCautionMin) {
    annotations.hrCautionMin = {
      type: 'line',
      yMin: settings.heartRateCautionMin,
      yMax: settings.heartRateCautionMin,
      yScaleID: 'heart-rate',
      borderColor: '#ff9800',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `심박수주의 ${settings.heartRateCautionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 152, 0, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  // 체온 기준선
  if (thresholdLines.temperatureAttentionMax) {
    annotations.tempAttentionMax = {
      type: 'line',
      yMin: settings.bodyTemperatureAttentionMax,
      yMax: settings.bodyTemperatureAttentionMax,
      yScaleID: 'temperature',
      borderColor: '#f44336',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `체온위험 ${settings.bodyTemperatureAttentionMax}°C`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.temperatureAttentionMin) {
    annotations.tempAttentionMin = {
      type: 'line',
      yMin: settings.bodyTemperatureAttentionMin,
      yMax: settings.bodyTemperatureAttentionMin,
      yScaleID: 'temperature',
      borderColor: '#f44336',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `체온위험 ${settings.bodyTemperatureAttentionMin}°C`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.temperatureCautionMax) {
    annotations.tempCautionMax = {
      type: 'line',
      yMin: settings.bodyTemperatureCautionMax,
      yMax: settings.bodyTemperatureCautionMax,
      yScaleID: 'temperature',
      borderColor: '#ff9800',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `체온주의 ${settings.bodyTemperatureCautionMax}°C`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(255, 152, 0, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.temperatureCautionMin) {
    annotations.tempCautionMin = {
      type: 'line',
      yMin: settings.bodyTemperatureCautionMin,
      yMax: settings.bodyTemperatureCautionMin,
      yScaleID: 'temperature',
      borderColor: '#ff9800',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `체온주의 ${settings.bodyTemperatureCautionMin}°C`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(255, 152, 0, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }

  // 🩸 혈당 기준선 추가
  if (thresholdLines.bloodSugarAttentionMax) {
    annotations.bsAttentionMax = {
      type: 'line',
      yMin: settings.bloodSugarAttentionMax,
      yMax: settings.bloodSugarAttentionMax,
      yScaleID: 'blood-sugar',
      borderColor: '#9c27b0',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `혈당위험 ${settings.bloodSugarAttentionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodSugarAttentionMin) {
    annotations.bsAttentionMin = {
      type: 'line',
      yMin: settings.bloodSugarAttentionMin,
      yMax: settings.bloodSugarAttentionMin,
      yScaleID: 'blood-sugar',
      borderColor: '#9c27b0',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        content: `혈당위험 ${settings.bloodSugarAttentionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        color: 'white',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodSugarCautionMax) {
    annotations.bsCautionMax = {
      type: 'line',
      yMin: settings.bloodSugarCautionMax,
      yMax: settings.bloodSugarCautionMax,
      yScaleID: 'blood-sugar',
      borderColor: '#e1bee7',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `혈당주의 ${settings.bloodSugarCautionMax}`,
        enabled: true,
        position: 'end',
        backgroundColor: 'rgba(225, 190, 231, 0.8)',
        color: 'black',
        font: { size: 10 }
      }
    };
  }
  
  if (thresholdLines.bloodSugarCautionMin) {
    annotations.bsCautionMin = {
      type: 'line',
      yMin: settings.bloodSugarCautionMin,
      yMax: settings.bloodSugarCautionMin,
      yScaleID: 'blood-sugar',
      borderColor: '#e1bee7',
      borderWidth: 2,
      borderDash: [3, 3],
      label: {
        content: `혈당주의 ${settings.bloodSugarCautionMin}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(225, 190, 231, 0.8)',
        color: 'black',
        font: { size: 10 }
      }
    };
  }
  
  console.log('🏁 최종 생성된 annotations:', annotations);
  console.log('🏁 annotations 개수:', Object.keys(annotations).length);
  
  return annotations;
};

// 차트 데이터셋 생성 - 🩸 혈당 추가
export const createChartDatasets = (processedData) => {
  const datasets = [];
  
  const actualData = processedData.filter(item => item.hasData);
  
  if (actualData.length > 0) {
    const bloodPressureHighData = processedData.map(item => item.hasData ? item.bloodPressureHigh : null);
    const bloodPressureLowData = processedData.map(item => item.hasData ? item.bloodPressureLow : null);
    const heartRateData = processedData.map(item => item.hasData ? item.heartRate : null);
    const temperatureData = processedData.map(item => item.hasData ? item.bodyTemperature : null);
    const bloodSugarData = processedData.map(item => item.hasData ? item.bloodSugar : null);
    
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
        spanGaps: false
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
      },
      {
        label: '혈당 (mg/dL)',
        data: bloodSugarData,
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
        yAxisID: 'blood-sugar',
        spanGaps: false
      }
    );
  }
  
  return datasets;
};
