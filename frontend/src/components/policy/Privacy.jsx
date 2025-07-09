import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Privacy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

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
            개인정보처리방침
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: '30px' }} />

        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          Healthcare Management System(이하 HealthCare)은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고자 다음과 같은 처리방침을 두고 있습니다.
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          1. 개인정보의 처리목적
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          - 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          - 건강관리 서비스 제공: 건강정보 모니터링, 응급상황 알림, 건강 데이터 분석
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          - 고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          2. 개인정보의 처리 및 보유기간
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </Typography>

        <Box sx={{
          marginTop: '20px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Box sx={{
            display: 'flex',
            '&:not(:last-child)': {
              borderBottom: '1px solid #eee'
            }
          }}>
            <Box sx={{
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              fontWeight: 'bold',
              color: '#333',  
              flex: '30%',
              borderRight: '1px solid #eee',
              flexShrink: 0
            }}>
              처리목적
            </Box>
            <Box sx={{
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              fontWeight: 'bold',
              color: '#333',  
              flex: '29.8%',
              flexShrink: 0
            }}>
              보유기간
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            '&:not(:last-child)': {
              borderBottom: '1px solid #eee'
            }
          }}>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              회원 가입 및 관리
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555'
            }}>
              회원 탈퇴 시까지
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            '&:not(:last-child)': {
              borderBottom: '1px solid #eee'
            }
          }}>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              건강정보 관리
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555'
            }}>
              서비스 이용 종료 후 1년
            </Box>
          </Box>
          <Box sx={{
            display: 'flex'
          }}>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              민원처리
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555'
            }}>
              민원 처리 완료 후 3년
            </Box>
          </Box>
        </Box>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          3. 개인정보의 제3자 제공
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          4. 개인정보의 처리위탁
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          현재 회사는 개인정보 처리업무를 외부에 위탁하지 않습니다. 향후 처리업무를 위탁하는 경우 위탁계약 체결 시 개인정보보호 관련 법령에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하겠습니다.
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          5. 정보주체의 권리·의무 및 행사방법
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          1. 개인정보 처리현황 통지요구
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          2. 개인정보 열람요구
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          3. 개인정보 정정·삭제요구
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          4. 개인정보 처리정지요구
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          6. 처리하는 개인정보 항목
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 다음의 개인정보 항목을 처리하고 있습니다:
        </Typography>

        <Box sx={{
          marginTop: '20px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Box sx={{
            display: 'flex',
            '&:not(:last-child)': {
              borderBottom: '1px solid #eee'
            }
          }}>
            <Box sx={{
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              fontWeight: 'bold',
              color: '#333',
              flex: '0 0 29.5%',
              borderRight: '1px solid #eee',
              flexShrink: 0
            }}>
              수집목적
            </Box>
            <Box sx={{
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              fontWeight: 'bold',
              color: '#333',
              flex: '0 0 29.5%',
              borderRight: '1px solid #eee',
              flexShrink: 0
            }}>
              필수항목
            </Box>
            <Box sx={{
              backgroundColor: '#f8f9fa',
              padding: '12px 15px',
              fontWeight: 'bold',
              color: '#333',
              flex: '0 0 50%',
              flexShrink: 0
            }}>
              선택항목
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            '&:not(:last-child)': {
              borderBottom: '1px solid #eee'
            }
          }}>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              회원가입
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              아이디, 비밀번호, 이름, 전화번호, 이메일, 관계
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555'
            }}>
              -
            </Box>
          </Box>
          <Box sx={{
            display: 'flex'
          }}>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              건강관리
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555',
              borderRight: '1px solid #eee'
            }}>
              고령자 이름, 생년월일, 성별
            </Box>
            <Box sx={{
              padding: '12px 15px',
              flex: 1,
              color: '#555'
            }}>
              주소, 긴급연락처, 만성질환, 복용약물, 특이사항
            </Box>
          </Box>
        </Box>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          7. 개인정보의 안전성 확보조치
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          1. 개인정보 취급 직원의 최소화 및 교육: 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          2. 정기적인 자체 감사: 개인정보 취급 관련 안정성 확보를 위해 정기적으로 자체 감사를 실시하고 있습니다.
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          3. 개인정보에 대한 접근 제한: 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있습니다.
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          4. 개인정보의 암호화: 이용자의 개인정보는 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하는 등의 별도 보안기능을 사용하고 있습니다.
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          8. 개인정보보호 책임자
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호 책임자를 지정하고 있습니다:
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          ▶ 개인정보보호 책임자
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          성명: Healthcare Team
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          연락처: healthcare@example.com
        </Typography>

        <Typography sx={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00458B',
          marginTop: '30px',
          marginBottom: '15px'
        }}>
          9. 개인정보 처리방침 변경
        </Typography>
        <Typography sx={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '15px'
        }}>
          이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </Typography>

        <Typography sx={{
          fontSize: '14px',
          color: '#888',
          textAlign: 'right',
          marginTop: '30px'
        }}>
          최종 업데이트: 2025년 1월 1일
        </Typography>
      </Paper>
    </Box>
  );
};

export default Privacy;