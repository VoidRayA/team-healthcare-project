import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

const RecentActivities = ({ 
  recentActivitiesData, 
  activitiesLoading 
}) => {
  return (
    <Paper sx={{
      backgroundColor: '#ffffff',
      border: theme => `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      padding: 2.5,
      minHeight: '450px',
      overflow: 'auto',
      boxShadow: 2
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        🔔 오늘의 알림
      </Typography>
      
      {/* 로딩 상태 또는 데이터 없을 때 처리 */}
      {activitiesLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            데이터를 불러오는 중...
          </Typography>
        </Box>
      ) : recentActivitiesData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            최근 활동 내역이 없습니다.
          </Typography>
        </Box>
      ) : (
        recentActivitiesData.map((activity, index) => (
          <Box key={index} sx={{
            display: 'flex',
            alignItems: 'center',
            padding: theme => theme.spacing(1.5, 0),
            borderBottom: theme => `1px solid ${theme.palette.grey[100]}`,
            '&:last-child': {
              borderBottom: 'none'
            }
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" fontWeight="500">
                  {activity.user}
                </Typography>
                <Chip
                  label={
                    activity.status === 'warning' ? '주의' :
                    activity.status === 'success' ? '정상' : '긴급'
                  }
                  color={activity.status === 'warning' ? 'warning' : 
                          activity.status === 'success' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {activity.activity}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: '60px' }}>
              <Typography variant="body2" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
          </Box>
        ))
      )}
    </Paper>
  );
};

export default RecentActivities;