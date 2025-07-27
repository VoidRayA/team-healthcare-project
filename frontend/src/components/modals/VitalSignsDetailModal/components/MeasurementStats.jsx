import React from 'react';
import { Box, Typography } from '@mui/material';

const MeasurementStats = ({ vitalData, statusAnalysis, processedData }) => {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#333' }}>
        📈 측정 통계
      </Typography>
      
      <Box sx={{ 
        flex: 1,
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 1,
        alignItems: 'center'
      }}>
        {/* 총 측정 */}
        <Box sx={{ 
          textAlign: 'center',
          p: 1,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: '500' }}>
            총 측정
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem', mt: 0.3 }}>
            {vitalData.length}
          </Typography>
        </Box>
        
        {statusAnalysis.counts && (
          <>
            {/* 정상 */}
            <Box sx={{ 
              textAlign: 'center',
              p: 1,
              backgroundColor: '#e8f5e8',
              borderRadius: 1,
              border: '1px solid #4caf50'
            }}>
              <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem', fontWeight: '500' }}>
                정상
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem', mt: 0.3 }}>
                {statusAnalysis.counts.normal}
              </Typography>
            </Box>
            
            {/* 주의 */}
            <Box sx={{ 
              textAlign: 'center',
              p: 1,
              backgroundColor: '#fff3e0',
              borderRadius: 1,
              border: '1px solid #ffc107'
            }}>
              <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.7rem', fontWeight: '500' }}>
                주의
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.1rem', mt: 0.3 }}>
                {statusAnalysis.counts.caution}
              </Typography>
            </Box>
            
            {/* 위험 */}
            <Box sx={{ 
              textAlign: 'center',
              p: 1,
              backgroundColor: '#ffebee',
              borderRadius: 1,
              border: '1px solid #f44336'
            }}>
              <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem', fontWeight: '500' }}>
                위험
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error" sx={{ fontSize: '1.1rem', mt: 0.3 }}>
                {statusAnalysis.counts.attention}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MeasurementStats;
