import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TermsPage = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: '20px 20px 40px 20px',
  minHeight: '100vh' // 최소 높이 설정
});

const TermsContainer = styled(Paper)({
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

const ContentText = styled(Typography)({
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#555',
  marginBottom: '15px'
});

const UpdateDate = styled(Typography)({
  fontSize: '14px',
  color: '#888',
  textAlign: 'right',
  marginTop: '30px'
});

const Terms = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <TermsPage>
      <TermsContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowBackIcon />
          </BackButton>
          <Title>이용약관</Title>
        </Header>

        <Divider sx={{ marginBottom: '30px' }} />

        <SectionTitle>제1조 (목적)</SectionTitle>
        <ContentText>
          이 약관은 Healthcare Management System(이하 HealthCareService)을 이용함에 있어 서비스 제공자와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </ContentText>

        <SectionTitle>제2조 (정의)</SectionTitle>
        <ContentText>
          1. "서비스"란 Healthcare Management System이 제공하는 건강관리 서비스를 의미합니다.
        </ContentText>
        <ContentText>
          2. "이용자"란 이 약관에 따라 서비스를 이용하는 회원을 말합니다.
        </ContentText>
        <ContentText>
          3. "보호자"란 고령자의 건강을 관리하고 모니터링하는 역할을 하는 이용자를 의미합니다.
        </ContentText>

        <SectionTitle>제3조 (약관의 효력 및 변경)</SectionTitle>
        <ContentText>
          1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
        </ContentText>
        <ContentText>
          2. 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 현행약관과 함께 서비스의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
        </ContentText>

        <SectionTitle>제4조 (회원가입)</SectionTitle>
        <ContentText>
          1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
        </ContentText>
        <ContentText>
          2. 회원가입신청서에는 다음 사항을 기재하여야 합니다:
          - 아이디 및 비밀번호
          - 이름, 전화번호, 이메일 주소
          - 기타 회사가 필요하다고 인정하는 사항
        </ContentText>

        <SectionTitle>제5조 (개인정보보호)</SectionTitle>
        <ContentText>
          회사는 관련법령이 정하는 바에 따라 회원 등록정보를 포함한 회원의 개인정보를 보호하기 위해 노력합니다. 회원의 개인정보보호에 관해서는 관련법령 및 회사의 개인정보보호정책이 적용됩니다.
        </ContentText>

        <SectionTitle>제6조 (건강정보 관리)</SectionTitle>
        <ContentText>
          1. 본 서비스를 통해 수집되는 건강정보는 의료법 및 개인정보보호법에 따라 엄격히 관리됩니다.
        </ContentText>
        <ContentText>
          2. 건강정보는 서비스 제공 목적 외에는 사용되지 않으며, 이용자의 동의 없이 제3자에게 제공되지 않습니다.
        </ContentText>

        <SectionTitle>제7조 (서비스의 이용)</SectionTitle>
        <ContentText>
          1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.
        </ContentText>
        <ContentText>
          2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
        </ContentText>

        <SectionTitle>제8조 (책임의 한계)</SectionTitle>
        <ContentText>
          1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
        </ContentText>
        <ContentText>
          2. 본 서비스는 건강관리 보조 도구로서 의료진의 진단이나 치료를 대체할 수 없습니다.
        </ContentText>

        <SectionTitle>제9조 (분쟁해결)</SectionTitle>
        <ContentText>
          이 약관에 명시되지 않은 사항과 이 약관의 해석에 관하여는 전자상거래 등에서의 소비자보호에 관한 법률, 약관의 규제 등에 관한 법률, 공정거래위원회가 정하는 전자상거래 등에서의 소비자 보호지침 및 관계법령 또는 상관례에 따릅니다.
        </ContentText>

        <UpdateDate>
          최종 업데이트: 2025년 1월 1일
        </UpdateDate>
      </TermsContainer>
    </TermsPage>
  );
};

export default Terms;