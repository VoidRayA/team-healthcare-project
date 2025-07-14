import { Box, Typography, Paper, Button, Divider, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

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
    <Box sx={{
      backgroundColor: '#f5f5f5',
      padding: '20px 20px 40px 20px',
      minHeight: '100vh'
    }}>
      <Paper sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '15px'
        }}>
          <Button 
            onClick={handleBack}
            sx={{
              minWidth: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              color: '#666',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            }}
          >
            <ArrowBackIcon />
          </Button>
          <Typography sx={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333',
            flex: 1
          }}>
            서비스 소개
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: '30px' }} />

        <Box sx={{
          backgroundColor: '#f8f9fc',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e3f2fd',
          marginBottom: '20px'
        }}>
          <Typography variant="h5" fontWeight="bold" color="#00458B" textAlign="center" gutterBottom>
            Healthcare Management System
          </Typography>
          <Typography sx={{
            fontSize: '18px',
            lineHeight: 1.6,
            color: '#555',
            textAlign: 'center',
            marginBottom: 0
          }}>
            고령자의 건강을 체계적으로 관리하고 보호자가 안심할 수 있는 
            스마트 헬스케어 솔루션입니다.
          </Typography>
        </Box>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          서비스 개요
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          Healthcare Management System은 고령자의 건강 상태를 실시간으로 모니터링하고, 
          보호자가 언제 어디서나 안심할 수 있도록 도와주는 종합 건강관리 플랫폼입니다.
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          최신 IoT 기술과 인공지능을 활용하여 건강 데이터를 분석하고, 
          응급상황 발생 시 즉시 알림을 제공합니다.
        </Typography>

        <Typography sx={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '40px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          주요 기능
        </Typography>
        
        <Grid container spacing={3} sx={{ marginBottom: '40px' }}>
          {features.map((feature, index) => (
            <Grid item xs={6} sm={6} md={6} lg={6} key={index}>
              <Card sx={{
                width: '250px',
                height: '250px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardContent sx={{ 
                  padding: '10px 10px',
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#00458B',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 15px'
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#333',
                    textAlign: 'center',
                    marginBottom: '10px'
                  }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{
                    fontSize: '14px',
                    color: '#666',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginTop: '10px',
                    whiteSpace: 'pre-line'
                  }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          서비스 특징
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          <strong>사용자 친화적 인터페이스:</strong> 고령자와 보호자 모두 쉽게 사용할 수 있는 직관적인 디자인
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          <strong>개인정보 보호:</strong> 의료급 보안 시스템으로 민감한 건강정보를 안전하게 보호
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          <strong>실시간 모니터링:</strong> 24시간 지속적인 건강 상태 추적 및 분석
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          <strong>맞춤형 알림:</strong> 개인별 건강 상태에 따른 맞춤형 알림 및 권고사항 제공
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          서비스 대상
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • <strong>고령자:</strong> 65세 이상 어르신으로 건강관리가 필요한 분
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • <strong>보호자:</strong> 부모님, 조부모님의 건강을 걱정하는 가족 구성원
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • <strong>의료진:</strong> 환자의 일상 건강 데이터가 필요한 의료 전문가
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          미래 계획
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          저희는 지속적인 서비스 개선을 통해 더욱 스마트하고 정확한 건강관리 솔루션을 제공하겠습니다:
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • AI 기반 건강 예측 시스템 도입
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • 의료기관과의 연동 서비스 확대
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • 웨어러블 디바이스 연동 기능 강화
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          • 가족 간 소통 기능 추가
        </Typography>

        <Box sx={{
          backgroundColor: '#f8f9fc',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #e3f2fd',
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <Typography variant="h6" fontWeight="bold" color="#00458B" gutterBottom>
            건강한 노후, 안심하는 가족
          </Typography>
          <Typography color="text.secondary">
            Healthcare Management System과 함께 소중한 가족의 건강을 지켜보세요.
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
};

export default About;