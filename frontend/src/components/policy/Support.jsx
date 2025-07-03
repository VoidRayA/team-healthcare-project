import { Box, Typography, Paper, Button, Divider, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const SupportPage = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: '20px 20px 40px 20px',
  minHeight: '100vh' // 최소 높이 설정
});

const SupportContainer = styled(Paper)({
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
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#00458B',
  marginTop: '30px',
  marginBottom: '15px'
});

const ContactCard = styled(Card)({
  marginBottom: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
  }
});

const ContactHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px'
});

const ContactIcon = styled(Box)({
  width: '40px',
  height: '40px',
  backgroundColor: '#00458B',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white'
});

const FAQCard = styled(Card)({
  marginBottom: '15px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
});

const FAQQuestion = styled(Typography)({
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#00458B',
  marginBottom: '8px'
});

const FAQAnswer = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  lineHeight: 1.5
});

const Support = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const faqData = [
    {
      question: "회원가입은 어떻게 하나요?",
      answer: "로그인 화면에서 '회원가입' 버튼을 클릭하고, 필요한 정보를 입력하시면 됩니다. 아이디, 비밀번호, 이름, 전화번호, 이메일, 관계 정보가 필요합니다."
    },
    {
      question: "비밀번호를 잊었어요.",
      answer: "현재는 개발 단계로 고객센터(healthcare@example.com)로 연락 주시면 도움을 드리겠습니다. 추후 비밀번호 찾기 기능이 추가될 예정입니다."
    },
    {
      question: "건강 데이터는 안전하게 보관되나요?",
      answer: "네, 모든 건강 데이터는 암호화되어 저장되며, 개인정보보호법에 따라 엄격하게 관리됩니다. 제3자에게 제공되지 않습니다."
    },
    {
      question: "여러 명의 고령자를 관리할 수 있나요?",
      answer: "네, 한 계정으로 여러 명의 고령자를 등록하고 관리할 수 있습니다."
    },
    {
      question: "응급상황 알림은 어떻게 작동하나요?",
      answer: "등록된 건강 데이터를 실시간으로 모니터링하여 이상 수치 발견 시 즉시 알림을 보내드립니다."
    },
    {
      question: "서비스 이용료가 있나요?",
      answer: "현재는 무료로 제공되는 서비스입니다. 추후 정책 변경 시 사전에 안내드리겠습니다."
    }
  ];

  return (
    <SupportPage>
      <SupportContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowBackIcon />
          </BackButton>
          <Title>고객센터</Title>
        </Header>

        <Divider sx={{ marginBottom: '30px' }} />

        <SectionTitle>문의하기</SectionTitle>
        
        <ContactCard>
          <CardContent>
            <ContactHeader>
              <ContactIcon>
                <EmailIcon />
              </ContactIcon>
              <Typography variant="h6" fontWeight="bold">이메일 문의</Typography>
            </ContactHeader>
            <Typography color="text.secondary" gutterBottom>
              healthcare@example.com
            </Typography>
            <Typography variant="body2">
              언제든지 문의사항을 보내주세요. 24시간 내에 답변드리겠습니다.
            </Typography>
          </CardContent>
        </ContactCard>

        <ContactCard>
          <CardContent>
            <ContactHeader>
              <ContactIcon>
                <PhoneIcon />
              </ContactIcon>
              <Typography variant="h6" fontWeight="bold">전화 문의</Typography>
            </ContactHeader>
            <Typography color="text.secondary" gutterBottom>
              1588-0000
            </Typography>
            <Typography variant="body2">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00 제외)
            </Typography>
          </CardContent>
        </ContactCard>

        <ContactCard>
          <CardContent>
            <ContactHeader>
              <ContactIcon>
                <AccessTimeIcon />
              </ContactIcon>
              <Typography variant="h6" fontWeight="bold">응급상황</Typography>
            </ContactHeader>
            <Typography color="text.secondary" gutterBottom>
              24시간 모니터링
            </Typography>
            <Typography variant="body2">
              시스템이 24시간 건강 상태를 모니터링하며, 응급상황 시 즉시 알림을 보내드립니다.
            </Typography>
          </CardContent>
        </ContactCard>

        <SectionTitle>자주 묻는 질문 (FAQ)</SectionTitle>
        
        {faqData.map((faq, index) => (
          <FAQCard key={index}>
            <CardContent>
              <FAQQuestion>
                Q. {faq.question}
              </FAQQuestion>
              <FAQAnswer>
                A. {faq.answer}
              </FAQAnswer>
            </CardContent>
          </FAQCard>
        ))}

        <SectionTitle>기타 문의</SectionTitle>
        <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '20px' }}>
          위 내용으로 해결되지 않는 문제가 있으시면 언제든지 연락 주세요. 
          최선을 다해 도움을 드리겠습니다.
        </Typography>

      </SupportContainer>
    </SupportPage>
  );
};

export default Support;