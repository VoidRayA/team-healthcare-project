import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Typography, 
  Box, 
  Button,
  Divider
} from '@mui/material';
import { ShowChart as ShowChartIcon } from '@mui/icons-material';

const ThresholdMenu = ({ 
  thresholdLines, 
  onThresholdLineChange, 
  selectedThresholdCount, 
  totalThresholdCount 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAll = () => {
    Object.keys(thresholdLines).forEach(key => {
      onThresholdLineChange(key)({ target: { checked: true } });
    });
  };

  const handleDeselectAll = () => {
    Object.keys(thresholdLines).forEach(key => {
      onThresholdLineChange(key)({ target: { checked: false } });
    });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          color: '#666',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          px: 1,
          '&:hover': {
            borderColor: '#1976d2',
            color: '#1976d2'
          }
        }}
      >
        <ShowChartIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
        <Typography sx={{ fontSize: '0.8rem' }}>
          기준선 ({selectedThresholdCount}/{totalThresholdCount})
        </Typography>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxWidth: 320,
            maxHeight: 400,
            '& .MuiMenuItem-root': {
              minHeight: 'auto',
              py: 0.5
            }
          }
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
            📊 기준선 설정
          </Typography>
        </MenuItem>
        
        <Divider />
        
        {/* 혈압 기준선들 */}
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
            🩸 혈압 (mmHg)
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureAttentionMax}
                onChange={onThresholdLineChange('bloodPressureAttentionMax')}
                size="small"
              />
            }
            label="위험 상한 (180)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureAttentionMin}
                onChange={onThresholdLineChange('bloodPressureAttentionMin')}
                size="small"
              />
            }
            label="위험 하한 (90)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureCautionMax}
                onChange={onThresholdLineChange('bloodPressureCautionMax')}
                size="small"
              />
            }
            label="주의 상한 (140)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>

        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.bloodPressureCautionMin}
                onChange={onThresholdLineChange('bloodPressureCautionMin')}
                size="small"
              />
            }
            label="주의 하한 (100)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <Divider />
        
        {/* 이완기 혈압 기준선들 */}
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
            🔴 이완기 혈압 (mmHg)
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.diastolicAttentionMax}
                onChange={onThresholdLineChange('diastolicAttentionMax')}
                size="small"
              />
            }
            label="위험 상한 (110)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.diastolicAttentionMin}
                onChange={onThresholdLineChange('diastolicAttentionMin')}
                size="small"
              />
            }
            label="위험 하한 (60)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.diastolicCautionMax}
                onChange={onThresholdLineChange('diastolicCautionMax')}
                size="small"
              />
            }
            label="주의 상한 (90)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>

        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.diastolicCautionMin}
                onChange={onThresholdLineChange('diastolicCautionMin')}
                size="small"
              />
            }
            label="주의 하한 (65)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <Divider />
        
        {/* 심박수 기준선들 */}
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
            💓 심박수 (bpm)
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateAttentionMax}
                onChange={onThresholdLineChange('heartRateAttentionMax')}
                size="small"
              />
            }
            label="위험 상한 (100)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateAttentionMin}
                onChange={onThresholdLineChange('heartRateAttentionMin')}
                size="small"
              />
            }
            label="위험 하한 (50)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateCautionMax}
                onChange={onThresholdLineChange('heartRateCautionMax')}
                size="small"
              />
            }
            label="주의 상한 (90)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>

        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.heartRateCautionMin}
                onChange={onThresholdLineChange('heartRateCautionMin')}
                size="small"
              />
            }
            label="주의 하한 (60)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <Divider />
        
        {/* 체온 기준선들 */}
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
            🌡️ 체온 (°C)
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.temperatureAttentionMax}
                onChange={onThresholdLineChange('temperatureAttentionMax')}
                size="small"
              />
            }
            label="위험 상한 (38.0)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <FormControlLabel
            control={
              <Checkbox
                checked={thresholdLines.temperatureCautionMax}
                onChange={onThresholdLineChange('temperatureCautionMax')}
                size="small"
              />
            }
            label="주의 상한 (37.5)"
            sx={{ fontSize: '0.8rem' }}
          />
        </MenuItem>
        
        <Divider />
        
        {/* 전체 제어 버튼 */}
        <MenuItem onClick={(e) => e.stopPropagation()}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAll}
              sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 2 }}
            >
              전체선택
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeselectAll}
              sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 2 }}
            >
              전체해제
            </Button>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThresholdMenu;
