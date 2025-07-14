import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  DeleteOutlined,
  AddOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { 
  getScheduleDropdownItemsWithId, 
  addScheduleItem, 
  deleteScheduleItem 
} from '../../api/apiClient';

const CategoryManageModal = ({ open, onClose, onUpdate }) => {
  const [items, setItems] = useState([]);
  const [newItemValue, setNewItemValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  // 기존 항목들 로드
  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getScheduleDropdownItemsWithId();
      console.log('로드된 항목들:', data);
      setItems(data);
      
    } catch (error) {
      console.error('항목 로드 오류:', error);
      setError('항목을 불러오는데 실패했습니다.');
      // 오류 시 빈 배열로 설정
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 새 항목 추가
  const handleAddItem = async () => {
    if (!newItemValue.trim()) {
      setError('항목명을 입력해주세요.');
      return;
    }

    // 중복 체크
    if (items.some(item => item.value === newItemValue.trim())) {
      setError('이미 존재하는 항목입니다.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await addScheduleItem(newItemValue.trim());
      
      if (result.success) {
        setSuccess('항목이 추가되었습니다.');
        setNewItemValue('');
        
        // 목록 새로고침
        await loadItems();
      } else {
        setError(result.message || '추가에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('항목 추가 오류:', error);
      setError('항목 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 항목 삭제
  const handleDeleteItem = async (itemId, itemValue) => {
    if (!window.confirm(`"${itemValue}" 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await deleteScheduleItem(itemId);
      
      if (result.success) {
        setSuccess('항목이 삭제되었습니다.');
        
        // 목록 새로고침
        await loadItems();
      } else {
        setError(result.message || '삭제에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('항목 삭제 오류:', error);
      setError('항목 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setNewItemValue('');
    setError('');
    setSuccess('');
    onClose();
    
    // 부모 컴포넌트에 변경 알림
    if (onUpdate) {
      onUpdate();
    }
  };

  // Enter 키 처리
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        borderBottom: '1px solid #e0e0e0',
        fontFamily: 'Pretendard',
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#0869CC'
      }}>
        카테고리 항목 관리
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 에러/성공 메시지 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* 기존 항목 목록 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold', 
            mb: 1.5,
            fontFamily: 'Pretendard',
            color: '#333'
          }}>
            기존 항목 ({items.length}개)
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 3,
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              border: '1px dashed #ddd'
            }}>
              <WarningAmberOutlined sx={{ color: '#999', fontSize: 32, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                등록된 항목이 없습니다
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              maxHeight: '200px',
              overflowY: 'auto',
              bgcolor: '#fafafa'
            }}>
              {items.map((item, index) => (
                <ListItem
                  key={item.id}
                  sx={{
                    borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDeleteItem(item.id, item.value)}
                      disabled={submitting}
                      sx={{
                        color: '#d32f2f',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)'
                        }
                      }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={item.value}
                    primaryTypographyProps={{
                      fontFamily: 'Pretendard',
                      fontSize: '14px'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 새 항목 추가 */}
        <Box>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold', 
            mb: 1.5,
            fontFamily: 'Pretendard',
            color: '#333'
          }}>
            새 항목 추가
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="새 항목명을 입력하세요"
              variant="outlined"
              size="small"
              fullWidth
              disabled={submitting}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'Pretendard',
                  fontSize: '14px'
                }
              }}
            />
            
            <Button
              onClick={handleAddItem}
              disabled={submitting || !newItemValue.trim()}
              variant="contained"
              size="small"
              startIcon={submitting ? <CircularProgress size={16} /> : <AddOutlined />}
              sx={{
                backgroundColor: '#0869CC',
                minWidth: '80px',
                fontFamily: 'Pretendard',
                fontSize: '12px',
                '&:hover': {
                  backgroundColor: '#065a9b'
                }
              }}
            >
              {submitting ? '추가중...' : '추가'}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2,
        borderTop: '1px solid #e0e0e0'
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{
            fontFamily: 'Pretendard',
            color: '#666',
            borderColor: '#ddd',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#ccc'
            }
          }}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryManageModal;
