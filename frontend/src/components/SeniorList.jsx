import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Pagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,
  NotificationsOutlined,
  EventOutlined,
  MessageOutlined,
  LogoutOutlined,
  EditOutlined
} from '@mui/icons-material';
import userImage from '../images/user.png';
import PasswordConfirmModal from './PasswordConfirmModal';

// Home.jsx와 동일한 스타일 구조
const MainContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#CCE5FF',
  display: 'flex',  
  gap: '0px',
  overflow: 'hidden'
});

const ContentContainer = styled(Paper)({
  backgroundColor: '#ffffff',  
  flex: 1,
  display: 'flex',
  overflow: 'auto',
  margin: '1vw 1vw 1vw 240px',
  height: 'calc(100vh - 2vw)',
  minHeight: 'calc(100vh - 2vw)'
});

const Sidebar = styled(Paper)({
  width: '240px',
  height: '100vh',
  backgroundColor: '#1976d2',
  borderRadius: '0 20px 20px 0',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
  color: 'white',
  boxSizing: 'border-box',
  flexShrink: 0,
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1000
});

const SidebarMenu = styled(List)({
  padding: '0 20px',
  flex: 1,
  '& .MuiListItem-root': {
    borderRadius: '12px',
    marginBottom: '8px',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    '&.active': {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '40px',
  }
});

// 메인 콘텐츠 - 패딩 줄이고 높이 최적화, 세로 중앙 정렬
const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '20px 30px'
});

// 페이지 제목 - 마진 줄임
const PageTitle = styled(Typography)({
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '28px',
  color: '#1976d2',
  marginBottom: '20px'
});

// 상단 검색 영역 - 간격 줄임
const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '15px',
  padding: '10px 0'
});

// 필터 버튼 - 원본 색상, 최적화된 사이즈
const FilterButton = styled(Button)({
  height: '40px',
  minWidth: '80px',
  backgroundColor: '#FFFFFF',
  color: '#003C78',
  border: '1px solid #00458B',
  borderRadius: '5px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '14px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f0f8ff'
  },
  '&.active': {
    backgroundColor: '#00458B',
    color: '#FFFFFF',
    borderColor: '#00458B'
  }
});

// 검색 입력 - 원본 색상, 최적화된 사이즈
const SearchInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    height: '40px',
    backgroundColor: '#FFFFFF',
    borderRadius: '5px',
    '& fieldset': {
      borderColor: '#00458B'
    },
    '&:hover fieldset': {
      borderColor: '#00458B'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00458B'
    }
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Pretendard',
    fontWeight: 700,
    fontSize: '14px',
    color: '#003C78',
    '&::placeholder': {
      color: '#003C78',
      opacity: 1
    }
  }
});

// 찾기 버튼 - 원본 색상, 최적화된 사이즈
const SearchButton = styled(Button)({
  height: '40px',
  minWidth: '70px',
  backgroundColor: '#007EFF',
  color: '#FFFFFF',
  borderRadius: '8px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '14px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#0066CC'
  }
});

// 추가 버튼 - 원본 색상, 최적화된 사이즈
const AddButton = styled(Button)({
  height: '40px',
  minWidth: '70px',
  backgroundColor: '#00458B',
  color: '#FFFFFF',
  borderRadius: '8px',
  fontFamily: 'Pretendard',
  fontWeight: 700,
  fontSize: '14px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003366'
  }
});

// 테이블 컨테이너 - 파란색 테두리 추가
const StyledTableContainer = styled(TableContainer)({
  backgroundColor: '#ffffff',
  borderRadius: '0',
  border: '2px solid #1976d2',
  boxShadow: 'none'
});

// 테이블 헤더 - 높이 줄임
const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-root': {
    backgroundColor: 'rgba(51, 153, 255, 0.3)',
    borderBottom: '2px solid #1976d2',
    fontFamily: 'Pretendard',
    fontWeight: 700,
    fontSize: '14px',
    color: '#000',
    textAlign: 'center',
    padding: '12px 6px',
    height: '45px'
  }
});

// 테이블 바디 - 높이 줄임 + 5행마다 굵은 선 (마지막 제외) + 클릭 가능
const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      backgroundColor: '#f8f9fa'
    },
    '&:hover': {
      backgroundColor: '#e3f2fd',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    // 5행마다 굵은 구분선 (마지막 행 제외)
    '&:nth-of-type(5):not(:last-child)': {
      '& .MuiTableCell-root': {
        borderBottom: '3px solid #1976d2'
      }
    }
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #1976d2',
    fontFamily: 'Pretendard',
    fontSize: '12px',
    color: '#333',
    textAlign: 'center',
    padding: '8px 6px',
    height: '35px'
  }
});

// 페이지네이션 컨테이너 - 마진 줄임
const PaginationContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '15px',
  padding: '10px 0'
});

const SeniorList = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('보호 대상자');
  const [guardianInfo, setGuardianInfo] = useState({
    name: '관리자',
    loginId: 'admin',
    role: 'ADMIN'
  });
  
  const [searchFilter, setSearchFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(13); // 임시값
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('guardianName');
    const savedLoginId = localStorage.getItem('loginId');
    const savedRole = localStorage.getItem('role');
    
    if (savedName && savedLoginId) {
      setGuardianInfo({
        name: savedName,
        loginId: savedLoginId,
        role: savedRole || 'GUARDIAN'
      });
    }
    
    // 보호 대상자 목록 로드
    loadSeniors();
  }, []);

  const loadSeniors = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      // const response = await getSeniors();
      
      // API가 준비되면 여기에 실제 데이터 로드 로직 추가
      console.log('데이터 로드 기늤리는 중...');
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('검색:', searchFilter, searchQuery);
    // TODO: 검색 로직 구현
  };

  const handleAddSenior = () => {
    navigate('/sjoin');
  };

  // 보호 대상자 수정 페이지로 이동
  const handleRowClick = (seniorId) => {
    navigate(`/senior/edit/${seniorId}`);
  };

  // 비밀번호 확인 모달 열기
  const handleProfileManagementClick = () => {
    setShowPasswordModal(true);
  };

  // 비밀번호 확인 성공 시 회원정보 관리로 이동
  const handlePasswordConfirm = () => {
    navigate('/profile/management');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('loginId');
    localStorage.removeItem('guardianName');
    localStorage.removeItem('role');
    
    alert('로그아웃 되었습니다.');
    window.location.reload();
  };

  const menuItems = [
    { text: '홈', icon: DashboardOutlined },
    { text: '회원정보 관리', icon: EditOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '안전 모니터링', icon: SecurityOutlined },
    { text: '알림 센터', icon: NotificationsOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '메시지', icon: MessageOutlined }
  ];

  return (
    <MainContainer>
      {/* 사이드바 */}
      <Sidebar elevation={0}>
        <Box sx={{ 
          px: 2, 
          py: 3, 
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            overflow: 'hidden'
          }}>
            <img 
              src={userImage} 
              alt="User" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
          
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            {guardianInfo.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
            {guardianInfo.role === 'ADMIN' ? '관리자' : '보호자'}
          </Typography>
        </Box>

        <SidebarMenu>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <ListItem
                key={index}
                className={activeMenu === item.text ? 'active' : ''}
                onClick={() => {
                  if (item.text === '홈') {
                    navigate('/home');
                  } else if (item.text === '회원정보 관리') {
                    handleProfileManagementClick();
                  } else if (item.text === '보호 대상자') {
                    setActiveMenu(item.text);
                  } else if (item.text === '일정 관리') {
                    navigate('/daily');
                  } else {
                    setActiveMenu(item.text);
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </SidebarMenu>

        <Box sx={{ px: 2 }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary="로그아웃" />
          </ListItem>
        </Box>
      </Sidebar>

      <ContentContainer elevation={0}>
        <MainContent>
          {/* 페이지 제목 */}
          <PageTitle>보호 대상자 리스트</PageTitle>
          
          {/* 검색 영역 */}
          <SearchContainer>
            <FilterButton 
              className={searchFilter === '항목' ? 'active' : ''}
              onClick={() => setSearchFilter('항목')}
            >
              항목
            </FilterButton>
            <FilterButton 
              className={searchFilter === '종류' ? 'active' : ''}
              onClick={() => setSearchFilter('종류')}
            >
              종류
            </FilterButton>
            <SearchInput
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
            />
            <SearchButton onClick={handleSearch}>
              찾기
            </SearchButton>
            <AddButton onClick={handleAddSenior}>
              추가
            </AddButton>
          </SearchContainer>

          {/* 테이블 */}
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>생년월일</TableCell>
                  <TableCell>성별</TableCell>
                  <TableCell>주소</TableCell>
                  <TableCell>보호 대상자 연락처</TableCell>
                  <TableCell>비상연락처</TableCell>
                  <TableCell>지병</TableCell>
                  <TableCell>복용 약물</TableCell>
                  <TableCell>특이사항</TableCell>
                </TableRow>
              </StyledTableHead>
              <StyledTableBody>
                {seniors.map((senior) => (
                  <TableRow 
                    key={senior.id}
                    onClick={() => handleRowClick(senior.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{senior.name}</TableCell>
                    <TableCell>{senior.birthDate}</TableCell>
                    <TableCell>{senior.gender}</TableCell>
                    <TableCell>{senior.address}</TableCell>
                    <TableCell>{senior.phone}</TableCell>
                    <TableCell>{senior.emergencyContact}</TableCell>
                    <TableCell>{senior.medicalConditions}</TableCell>
                    <TableCell>{senior.medications}</TableCell>
                    <TableCell>{senior.specialNotes}</TableCell>
                  </TableRow>
                ))}
                {/* 빈 행들 (디자인을 위해) */}
                {Array.from({ length: Math.max(0, 10 - seniors.length) }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                  </TableRow>
                ))}
              </StyledTableBody>
            </Table>
          </StyledTableContainer>

          {/* 페이지네이션 */}
          <PaginationContainer>
            <Typography variant="body2" sx={{ mr: 2, color: '#666' }}>
              {currentPage}/{totalPages}
            </Typography>
            <Pagination 
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
              showFirstButton 
              showLastButton
            />
          </PaginationContainer>
        </MainContent>
      </ContentContainer>
      
      {/* 비밀번호 확인 모달 */}
      <PasswordConfirmModal 
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
      />
    </MainContainer>
  );
};

export default SeniorList;