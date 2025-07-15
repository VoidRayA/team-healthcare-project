import React from 'react';
import { Box, Typography, Container, Tabs, Tab, Paper } from '@mui/material';
import MapExample from './MapExample';
import SeniorLocationMap from './SeniorLocationMap';

const MapDemo = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        헬스케어 지도 서비스
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="보호 대상자 위치 추적" />
          <Tab label="의료시설 검색" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <SeniorLocationMap 
            seniorId={1} 
            seniorName="김할머니" 
          />
        )}
        
        {tabValue === 1 && (
          <MapExample />
        )}
      </Box>
    </Container>
  );
};

export default MapDemo;
