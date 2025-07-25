import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const DetailAnalysis = ({ statusAnalysis, vitalData }) => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#333' }}>
        🔍 항목별 분석
      </Typography>
      
      {statusAnalysis.details && (
        vitalData.length > 0 ? (
          <Box sx={{ 
            flex: 1,
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 1,
            overflow: 'auto'
          }}>
            {/* 혈압 */}
            <Box sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>
                🩸 혈압 ({statusAnalysis.details.bloodPressure.attention + statusAnalysis.details.bloodPressure.caution + statusAnalysis.details.bloodPressure.normal + statusAnalysis.details.bloodPressure.emergency}건)
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                {statusAnalysis.details.bloodPressure.attention > 0 && (
                  <Chip size="small" label={`주의 ${statusAnalysis.details.bloodPressure.attention}`} color="warning" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodPressure.caution > 0 && (
                  <Chip size="small" label={`관찰 ${statusAnalysis.details.bloodPressure.caution}`} color="info" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodPressure.normal > 0 && (
                  <Chip size="small" label={`정상 ${statusAnalysis.details.bloodPressure.normal}`} color="success" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodPressure.emergency > 0 && (
                  <Chip size="small" label={`응급 ${statusAnalysis.details.bloodPressure.emergency}`} color="error" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
              </Box>
            </Box>
            
            {/* 심박수 */}
            <Box sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>
                💓 심박수 ({statusAnalysis.details.heartRate.attention + statusAnalysis.details.heartRate.caution + statusAnalysis.details.heartRate.normal + statusAnalysis.details.heartRate.emergency}건)
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                {statusAnalysis.details.heartRate.attention > 0 && (
                  <Chip size="small" label={`주의 ${statusAnalysis.details.heartRate.attention}`} color="warning" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.heartRate.caution > 0 && (
                  <Chip size="small" label={`관찰 ${statusAnalysis.details.heartRate.caution}`} color="info" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.heartRate.normal > 0 && (
                  <Chip size="small" label={`정상 ${statusAnalysis.details.heartRate.normal}`} color="success" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.heartRate.emergency > 0 && (
                  <Chip size="small" label={`응급 ${statusAnalysis.details.heartRate.emergency}`} color="error" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
              </Box>
            </Box>
            
            {/* 체온 */}
            <Box sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>
                🌡️ 체온 ({statusAnalysis.details.temperature.attention + statusAnalysis.details.temperature.caution + statusAnalysis.details.temperature.normal + statusAnalysis.details.temperature.emergency}건)
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                {statusAnalysis.details.temperature.attention > 0 && (
                  <Chip size="small" label={`주의 ${statusAnalysis.details.temperature.attention}`} color="warning" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.temperature.caution > 0 && (
                  <Chip size="small" label={`관찰 ${statusAnalysis.details.temperature.caution}`} color="info" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.temperature.normal > 0 && (
                  <Chip size="small" label={`정상 ${statusAnalysis.details.temperature.normal}`} color="success" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.temperature.emergency > 0 && (
                  <Chip size="small" label={`응급 ${statusAnalysis.details.temperature.emergency}`} color="error" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
              </Box>
            </Box>
            
            {/* 혈당 */}
            <Box sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>
                🍯 혈당 ({statusAnalysis.details.bloodSugar.attention + statusAnalysis.details.bloodSugar.caution + statusAnalysis.details.bloodSugar.normal + statusAnalysis.details.bloodSugar.emergency}건)
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                {statusAnalysis.details.bloodSugar.attention > 0 && (
                  <Chip size="small" label={`주의 ${statusAnalysis.details.bloodSugar.attention}`} color="warning" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodSugar.caution > 0 && (
                  <Chip size="small" label={`관찰 ${statusAnalysis.details.bloodSugar.caution}`} color="info" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodSugar.normal > 0 && (
                  <Chip size="small" label={`정상 ${statusAnalysis.details.bloodSugar.normal}`} color="success" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
                {statusAnalysis.details.bloodSugar.emergency > 0 && (
                  <Chip size="small" label={`응급 ${statusAnalysis.details.bloodSugar.emergency}`} color="error" sx={{ fontSize: '0.65rem', height: '20px' }} />
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography variant="caption" sx={{ color: '#999' }}>
              데이터 없음
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default DetailAnalysis;
