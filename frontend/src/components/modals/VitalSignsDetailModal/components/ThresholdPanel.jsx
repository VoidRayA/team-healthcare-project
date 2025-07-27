import React from 'react';
import { Paper, Typography, Box, FormControlLabel, Checkbox, Button } from '@mui/material';

const ThresholdPanel = ({ 
  thresholdLines, 
  onThresholdLineChange, 
  selectedThresholdCount, 
  totalThresholdCount 
}) => {
  const handleSelectAll = () => {
    const allTrue = Object.fromEntries(
      Object.keys(thresholdLines).map(key => [key, true])
    );
    Object.keys(allTrue).forEach(key => {
      onThresholdLineChange(key)({ target: { checked: true } });
    });
  };

  const handleDeselectAll = () => {
    const allFalse = Object.fromEntries(
      Object.keys(thresholdLines).map(key => [key, false])
    );
    Object.keys(allFalse).forEach(key => {
      onThresholdLineChange(key)({ target: { checked: false } });
    });
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1.5, 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        maxWidth: 300,
        maxHeight: 200,
        overflow: 'auto'
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 1, display: 'block' }}>
        📊 기준선 ({selectedThresholdCount}/{totalThresholdCount})
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
        {/* 혈압 기준선들 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureAttentionMax}
                onChange={onThresholdLineChange('bloodPressureAttentionMax')}
                size="small"
              />
            }
            label={`혈압 위험 ↑`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureAttentionMin}
                onChange={onThresholdLineChange('bloodPressureAttentionMin')}
                size="small"
              />
            }
            label={`혈압 위험 ↓`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureCautionMax}
                onChange={onThresholdLineChange('bloodPressureCautionMax')}
                size="small"
              />
            }
            label={`혈압 주의 ↑`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
        </Box>
        
        {/* 심박수 기준선들 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateAttentionMax}
                onChange={onThresholdLineChange('heartRateAttentionMax')}
                size="small"
              />
            }
            label={`심박 위험 ↑`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateAttentionMin}
                onChange={onThresholdLineChange('heartRateAttentionMin')}
                size="small"
              />
            }
            label={`심박 위험 ↓`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.temperatureAttentionMax}
                onChange={onThresholdLineChange('temperatureAttentionMax')}
                size="small"
              />
            }
            label={`체온 위험 ↑`}
            sx={{ fontSize: '0.7rem', '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
          />
        </Box>
        
        {/* 전체 제어 버튼 */}
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAll}
            sx={{ fontSize: '0.6rem', minWidth: 'auto', px: 1, py: 0.2 }}
          >
            전체선택
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleDeselectAll}
            sx={{ fontSize: '0.6rem', minWidth: 'auto', px: 1, py: 0.2 }}
          >
            전체해제
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ThresholdPanel;
