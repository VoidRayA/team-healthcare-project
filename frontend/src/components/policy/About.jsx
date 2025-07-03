import { Box, Typography, Paper, Button, Divider, Card, CardContent, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const AboutPage = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: '20px 20px 40px 20px',
  minHeight: '100vh' // 최소 높이 설정
});

const AboutContainer = styled(Paper)({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
});

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '30px',
  gap: '15px'
});

const BackButton = styled(Button)({
  minWidth: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: '#f0f0f0',
  color: '#666',
  '&:hover': {
    backgroundColor: '#e0e0e0'
  }
});

const Title = styled(Typography)({
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#333',
  flex: 1
});

const SectionTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#00458B',
  marginTop: '40px',
  marginBottom: '20px',
  textAlign: 'center'
});

const SubSectionTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#00458B',
  marginTop: '30px',
  marginBottom: '15px'
});

const ContentText = styled(Typography)({
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#555',
  marginBottom: '15px'
});

const FeatureCard = styled(Card)({
  width: '250px',
  height: '250px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  }
});

const FeatureIcon = styled(Box)({
  width: '60px',
  height: '60px',
  backgroundColor: '#00458B',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  margin: '0 auto 15px'
});

const FeatureTitle = styled(Typography)({
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center',
  marginBottom: '10px'
});

const FeatureDescription = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  lineHeight: 1.6, // 라인 간격 늘림
  marginTop: '10px', // 위쪽 여백 추가
  whiteSpace: 'pre-line' // 줄바꿈 인식 추가
});

const HighlightBox = styled(Box)({
  backgroundColor: '#f8f9fc',
  padding: '20px',
  borderRadius: '12px',
  border: '2px solid #e3f2fd',
  marginBottom: '20px'
});

const About = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const features = [
    {
      icon: <MonitorHeartIcon fontSize="large" />,
      title: "실시간 건강 모니터링",
      description: "24시간 건강 상태를 모니터링하여\n이상 징후를 빠르게 감지합니다."
    },
    {
      icon: <NotificationsActiveIcon fontSize="large" />,
      title: "즉시 알림 시스템",
      description: "응급상황 발생 시 보호자에게\n즉시 알림을 전송합니다."
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "안전한 데이터 보호",
      description: "의료급 보안 시스템으로\n개인정보를 안전하게 보호합니다."
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "다중 사용자 관리",
      description: "한 계정으로 여러 명의 고령자를\n동시에 관리할 수 있습니다."
    },
    {
      icon: <AssessmentIcon fontSize="large" />,
      title: "건강 리포트",
      description: "일간, 주간, 월간 건강 데이터를\n분석하여 리포트를 제공합니다."
    },
    {
      icon: <SupportAgentIcon fontSize="large" />,
      title: "24시간 지원",
      description: "언제든지 문의할 수 있는\n고객지원 서비스를 제공합니다."
    }
  ];

  return (
    <AboutPage>
      <AboutContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowBackIcon />
          </BackButton>
          <Title>서비스 소개</Title>
        </Header>

        <Divider sx={{ marginBottom: '30px' }} />

        <HighlightBox>
          <Typography variant="h5" fontWeight="bold" color="#00458B" textAlign="center" gutterBottom>
            Healthcare Management System
          </Typography>
          <ContentText style={{ textAlign: 'center', fontSize: '18px', marginBottom: 0 }}>
            고령자의 건강을 체계적으로 관리하고 보호자가 안심할 수 있는 
            스마트 헬스케어 솔루션입니다.
          </ContentText>
        </HighlightBox>

        <SubSectionTitle>서비스 개요</SubSectionTitle>
        <ContentText>
          Healthcare Management System은 고령자의 건강 상태를 실시간으로 모니터링하고, 
          보호자가 언제 어디서나 안심할 수 있도록 도와주는 종합 건강관리 플랫폼입니다.
        </ContentText>
        <ContentText>
          최신 IoT 기술과 인공지능을 활용하여 건강 데이터를 분석하고, 
          응급상황 발생 시 즉시 알림을 제공합니다.
        </ContentText>

        <SectionTitle>주요 기능</SectionTitle>
        
        <Grid container spacing={3} sx={{ marginBottom: '40px' }}>
          {features.map((feature, index) => (
            <Grid item xs={6} sm={6} md={6} lg={6} key={index}>
              <FeatureCard>
                <CardContent sx={{ 
                  padding: '10px 10px',
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FeatureIcon>
                    {feature.icon}
                  </FeatureIcon>
                  <FeatureTitle>
                    {feature.title}
                  </FeatureTitle>
                  <FeatureDescription>
                    {feature.description}
                  </FeatureDescription>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>

        <SubSectionTitle>서비스 특징</SubSectionTitle>
        <ContentText>
          <strong>사용자 친화적 인터페이스:</strong> 고령자와 보호자 모두 쉽게 사용할 수 있는 직관적인 디자인
        </ContentText>
        <ContentText>
          <strong>개인정보 보호:</strong> 의료급 보안 시스템으로 민감한 건강정보를 안전하게 보호
        </ContentText>
        <ContentText>
          <strong>실시간 모니터링:</strong> 24시간 지속적인 건강 상태 추적 및 분석
        </ContentText>
        <ContentText>
          <strong>맞춤형 알림:</strong> 개인별 건강 상태에 따른 맞춤형 알림 및 권고사항 제공
        </ContentText>

        <SubSectionTitle>서비스 대상</SubSectionTitle>
        <ContentText>
          • <strong>고령자:</strong> 65세 이상 어르신으로 건강관리가 필요한 분
        </ContentText>
        <ContentText>
          • <strong>보호자:</strong> 부모님, 조부모님의 건강을 걱정하는 가족 구성원
        </ContentText>
        <ContentText>
          • <strong>의료진:</strong> 환자의 일상 건강 데이터가 필요한 의료 전문가
        </ContentText>

        <SubSectionTitle>미래 계획</SubSectionTitle>
        <ContentText>
          저희는 지속적인 서비스 개선을 통해 더욱 스마트하고 정확한 건강관리 솔루션을 제공하겠습니다:
        </ContentText>
        <ContentText>
          • AI 기반 건강 예측 시스템 도입
        </ContentText>
        <ContentText>
          • 의료기관과의 연동 서비스 확대
        </ContentText>
        <ContentText>
          • 웨어러블 디바이스 연동 기능 강화
        </ContentText>
        <ContentText>
          • 가족 간 소통 기능 추가
        </ContentText>

        <HighlightBox style={{ textAlign: 'center', marginTop: '40px' }}>
          <Typography variant="h6" fontWeight="bold" color="#00458B" gutterBottom>
            건강한 노후, 안심하는 가족
          </Typography>
          <Typography color="text.secondary">
            Healthcare Management System과 함께 소중한 가족의 건강을 지켜보세요.
          </Typography>
        </HighlightBox>

      </AboutContainer>
    </AboutPage>
  );
};

export default About;