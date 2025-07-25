// 로컬 시간대 기준 날짜 문자열 생성 함수
export const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 24시간 데이터 처리
export const processVitalDataFor24Hours = (rawData) => {
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

  return {
    processedData: allHours,
    lastMeasurementHour: lastMeasurementHour
  };
};
