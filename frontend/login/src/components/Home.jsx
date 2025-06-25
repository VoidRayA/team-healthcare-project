import { useState } from 'react';
import { Box, Button, Paper, } from '@mui/material';
import { styled } from '@mui/material/styles';

const HomePage = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#01b1ff'
});

const HomeLayout = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: '30px',
  paddig: '60px',
  gap: '60px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '1000px',
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    padding: '40px',
    gap: '40px'
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: '30px 20px',
    gap: '30px'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 15px'
  }
}));

const HomeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '15px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    gap: '10px'
  }
}));

const HomeSidebar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '15px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    gap: '10px'
  }
}));

const HomeContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '15px',
  marginBottom: '20px',
  [theme.breakpoints.down('sm')]: {
    gap: '10px'
  }
}));

const Home = () =>  {
  return (
    <HomePage>
      <HomeHeader />
      <HomeLayout>
        <HomeSidebar />
        <HomeContent />
      </HomeLayout>
    </HomePage>
  );
};

export default Home;