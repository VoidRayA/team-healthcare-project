import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Pagination,
  IconButton,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getAuthToken } from '../../utils/auth';

const SeniorSelectModal = ({ open, onClose, onSelect, selectedSenior }) => {
  const [searchFilter, setSearchFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [seniors, setSeniors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSeniorId, setSelectedSeniorId] = useState(null);

  useEffect(() => {
    if (open) {
      loadSeniors();
      if (selectedSenior) {
        setSelectedSeniorId(selectedSenior.id);
      }
    }
  }, [open, selectedSenior]);

  const loadSeniors = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`/api/seniors?page=${currentPage - 1}&size=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSeniors(data.content);
        setTotalPages(data.totalPages);
      } else {
        setError('보호 대상자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      setError('');
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/seniors/search?name=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSeniors(data);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          setError('검색에 실패했습니다.');
        }
      } catch (error) {
        console.error('검색 오류:', error);
        setError('검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      loadSeniors();
    }
  };

  const handleSeniorSelect = (senior) => {
    setSelectedSeniorId(senior.id);
  };

  const handleConfirm = () => {
    const selected = seniors.find(s => s.id === selectedSeniorId);
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSeniorId(null);
    setSearchQuery('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width: '90vw',
          maxWidth: '1200px',
          height: '80vh',
          maxHeight: '800px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#1976d2',
        color: 'white',
        fontFamily: 'Pretendard',
        fontWeight: 700
      }}>
        보호 대상자 선택
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: '20px' }}>
        {/* 검색 영역 */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '15px',
          padding: '10px 0'
        }}>
          <Button
            onClick={() => setSearchFilter('이름')}
            sx={{
              height: '40px',
              minWidth: '80px',
              backgroundColor: searchFilter === '이름' ? '#00458B' : '#FFFFFF',
              color: searchFilter === '이름' ? '#FFFFFF' : '#003C78',
              border: '1px solid #00458B',
              borderRadius: '5px',
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: searchFilter === '이름' ? '#00458B' : '#f0f8ff'
              }
            }}
          >
            이름
          </Button>
          <TextField
            placeholder="보호 대상자 이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            variant="outlined"
            sx={{
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
            }}
          />
          <Button 
            onClick={handleSearch}
            sx={{
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
            }}
          >
            찾기
          </Button>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ marginBottom: '15px' }}>
            {error}
          </Alert>
        )}

        {/* 테이블 */}
        <TableContainer 
          component={Paper}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '0',
            border: '2px solid #1976d2',
            boxShadow: 'none',
            maxHeight: '400px'
          }}
        >
          <Table stickyHeader>
            <TableHead sx={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              '& .MuiTableCell-root': {
                backgroundColor: 'rgba(51, 153, 255, 1)', // 반투명도 제거 (0.3 → 1)
                borderBottom: '2px solid #1976d2',
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '14px',
                color: '#000',
                textAlign: 'center',
                padding: '12px 6px',
                height: '45px',
                backdropFilter: 'none', // 블러 효과 제거
              }
            }}>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>생년월일</TableCell>
                <TableCell>성별</TableCell>
                <TableCell>주소</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>비상연락처</TableCell>
                <TableCell>지병</TableCell>
                <TableCell>복용 약물</TableCell>
                <TableCell>특이사항</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{
              '& .MuiTableRow-root': {
                '&:nth-of-type(even)': {
                  backgroundColor: '#f8f9fa'
                },
                '&.data-row:hover': {
                  backgroundColor: '#e3f2fd',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                },
                '&.selected': {
                  backgroundColor: '#bbdefb !important'
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
            }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : seniors.length > 0 ? (
                seniors.map((senior) => (
                  <TableRow 
                    key={senior.id}
                    className={`data-row ${selectedSeniorId === senior.id ? 'selected' : ''}`}
                    onClick={() => handleSeniorSelect(senior)}
                  >
                    <TableCell>{senior.seniorName}</TableCell>
                    <TableCell>{senior.birthDate}</TableCell>
                    <TableCell>{senior.gender}</TableCell>
                    <TableCell>{senior.address}</TableCell>
                    <TableCell>{senior.phoneNumber}</TableCell>
                    <TableCell>{senior.emergencyContact}</TableCell>
                    <TableCell>{senior.medicalConditions}</TableCell>
                    <TableCell>{senior.medications}</TableCell>
                    <TableCell>{senior.specialNotes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', padding: '20px' }}>
                    등록된 보호 대상자가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '15px',
            padding: '10px 0',
            gap: '8px'
          }}>
            <Pagination 
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => {
                setCurrentPage(page);
                // 페이지 변경 시 데이터 다시 로드 (useEffect에서 처리됨)
              }}
              color="primary"
              showFirstButton 
              showLastButton
            />
            <Typography variant="body2" sx={{ color: '#666' }}>
              {currentPage}/{totalPages}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: '#666',
            fontFamily: 'Pretendard',
            fontWeight: 600
          }}
        >
          취소
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedSeniorId}
          variant="contained"
          sx={{ 
            backgroundColor: '#1976d2',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            '&:disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeniorSelectModal;