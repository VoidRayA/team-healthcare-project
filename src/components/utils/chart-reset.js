// 차트 Canvas 강제 리셋 함수 - 완전히 새로운 접근법
const forceCanvasReset = () => {
  console.log('🔧 차트 Canvas 강제 리셋 시작');
  
  const bloodPressureCanvas = document.getElementById('bloodPressureChart');
  const heartRateTemperatureCanvas = document.getElementById('heartRateTemperatureChart');
  
  if (!bloodPressureCanvas || !heartRateTemperatureCanvas) {
    console.warn('⚠️ Canvas 요소를 찾을 수 없음');
    return false;
  }
  
  // 기존 차트 완전 제거
  [bloodPressureCanvas, heartRateTemperatureCanvas].forEach((canvas, index) => {
    const name = index === 0 ? '혈압' : '심박수+체온';
    console.log(`🗑️ ${name} Canvas 리셋`);
    
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // Canvas 완전 초기화
    canvas.removeAttribute('style');
    canvas.width = 0;
    canvas.height = 0;
    
    // 강제 스타일 재적용 (높이 200px로 통일)
    canvas.style.cssText = `
      width: 100% !important;
      height: 200px !important;
      max-height: 200px !important;
      min-height: 200px !important;
      display: block !important;
      box-sizing: border-box !important;
    `;
    
    // 부모 컨테이너도 강제 리셋
    const container = canvas.parentElement;
    if (container) {
      container.style.cssText = `
        height: 200px !important;
        max-height: 200px !important;
        min-height: 200px !important;
        overflow: hidden !important;
        position: relative !important;
        box-sizing: border-box !important;
      `;
    }
  });
  
  console.log('✅ 모든 차트 Canvas 강제 리셋 완료 (200px)');
  return true;
};
