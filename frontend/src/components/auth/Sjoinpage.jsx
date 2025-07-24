import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Select,
  InputLabel,
  MenuItem
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,
  NotificationsOutlined,
  EventOutlined,
  MessageOutlined,
  LogoutOutlined,
  EditOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import userImage from '../../images/user.png';
import { getUserInfo, clearAuthData, getAuthToken } from '../../utils/auth';
import { getSeniorById, createSenior, updateSenior } from '../../api/apiClient';

const Sjoinpage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL 파라미터에서 ID 가져오기
  const isEditMode = Boolean(id); // ID가 있으면 수정 모드
  
  const [activeMenu, setActiveMenu] = useState('보호 대상자');
  const [guardianInfo, setGuardianInfo] = useState(() => {
    const userInfo = getUserInfo();
    return userInfo ? {
      name: userInfo.name,
      loginId: userInfo.loginId,
      role: userInfo.role || 'GUARDIAN'
    } : {
      name: '관리자',
      loginId: 'admin',
      role: 'ADMIN'
    };
  });
  
  const [formData, setFormData] = useState({
    seniorName: '',
    birthDate: '',
    calendarType: '양력',
    gender: '남성',
    address: '',
    phone: '',
    emergencyContact: '',
    medicalConditions: '',
    medications: '',
    specialNotes: '',
    deviceSettings: {
      bloodPressureMonitor: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
      thermometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
      glucometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
      pulseOximeter: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
      wearableDevice: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 수정 모드일 때 기존 데이터 로드
    if (isEditMode && id) {
      loadSeniorData(id);
    }
  }, [isEditMode, id]);

  // 수정 모드일 때 기존 데이터 로드
  const loadSeniorData = async (seniorId) => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        setError('로그인이 필요합니다.');
        navigate('/');
        return;
      }
      
      // 실제 API 호출
      const response = await getSeniorById(seniorId);
      console.log('보호 대상자 데이터 로드 성공:', response);
      
      if (response) {
        // 데이터 포맷팅
        setFormData({
          seniorName: response.seniorName || '',
          birthDate: response.birthDate ? response.birthDate.replace(/-/g, '') : '',
          calendarType: '양력',  // 기본값 사용
          gender: response.gender === 'M' ? '남성' : '여성',
          address: response.address || '',
          phone: response.phone || '',
          emergencyContact: response.emergencyContact || '',
          medicalConditions: response.chronicDiseases || '',
          medications: response.medications || '',
          specialNotes: response.notes || '',
          deviceSettings: response.deviceSettings || {
            bloodPressureMonitor: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            thermometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            glucometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            pulseOximeter: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            wearableDevice: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' }
          }
        });
      }
      
    } catch (err) {
      console.error('보호 대상자 데이터 로드 오류:', err);
      if (err.response?.status === 404) {
        setError('해당 보호 대상자를 찾을 수 없습니다.');
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setError('');
  };

  // 기기 설정 뚀들러 함수
  const handleDeviceChange = (deviceType, field, value) => {
    setFormData(prev => ({
      ...prev,
      deviceSettings: {
        ...prev.deviceSettings,
        [deviceType]: {
          ...prev.deviceSettings[deviceType],
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    if (!formData.seniorName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.birthDate.trim()) {
      setError('생년월일을 입력해주세요.');
      return false;
    }
    if (!formData.address.trim()) {
      setError('주소를 입력해주세요.');
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      setError('비상 연락처를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      if (!token) {
        setError('로그인이 필요합니다.');
        navigate('/');
        return;
      }

      // API에 전송할 데이터 포맷팅
      const submitData = {
        seniorName: formData.seniorName,
        birthDate: formData.birthDate.length === 8 
          ? `${formData.birthDate.slice(0, 4)}-${formData.birthDate.slice(4, 6)}-${formData.birthDate.slice(6, 8)}`
          : formData.birthDate,
        gender: formData.gender === '남성' ? 'M' : 'F',  // Character 타입으로 변경
        address: formData.address,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        chronicDiseases: formData.medicalConditions || null,
        medications: formData.medications || null,
        notes: formData.specialNotes || null,
        deviceSettings: formData.deviceSettings || null
      };

      console.log('Senior 등록/수정 데이터:', submitData);
      
      let response;
      if (isEditMode) {
        // 수정 API 호출
        response = await updateSenior(id, submitData);
      } else {
        // 등록 API 호출
        response = await createSenior(submitData);
      }
      
      console.log('API 응답:', response);
      
      setSuccess(isEditMode ? '보호 대상자 정보가 성공적으로 수정되었습니다!' : '보호 대상자가 성공적으로 등록되었습니다!');
      
      if (!isEditMode) {
        // 등록 모드일 때만 폼 초기화
        setFormData({
          seniorName: '',
          birthDate: '',
          calendarType: '양력',
          gender: '남성',
          address: '',
          phone: '',
          emergencyContact: '',
          medicalConditions: '',
          medications: '',
          specialNotes: '',
          deviceSettings: {
            bloodPressureMonitor: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            thermometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            glucometer: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            pulseOximeter: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' },
            wearableDevice: { enabled: false, deviceModel: '', deviceId: '', connectionType: 'bluetooth' }
          }
        });
      }
      
      // 2초 후 보호 대상자 리스트로 이동
      setTimeout(() => {
        navigate('/seniors');
      }, 2000);
      
    } catch (err) {
      console.error('Senior 등록/수정 오류:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(isEditMode ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    
    alert('로그아웃 되었습니다.');
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('authStateChange'));
    window.location.reload();
  };

  const menuItems = [
    { text: '홈', icon: DashboardOutlined },
    { text: '회원정보 관리', icon: EditOutlined },
    { text: '보호 대상자', icon: PeopleOutlined },
    { text: '일정 관리', icon: EventOutlined },
    { text: '설정', icon: SettingsOutlined }
  ];

  // 공통 텍스트 필드 스타일
  const textFieldSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      border: 'none',
      '& fieldset': {
        border: 'none'
      },
      '&:hover fieldset': {
        border: 'none'
      },
      '&.Mui-focused fieldset': {
        border: 'none'
      }
    },
    '& .MuiInputBase-input': {
      fontFamily: 'Pretendard',
      fontWeight: 500,
      fontSize: '16px',
      color: '#333',
      padding: '0',
      '&::placeholder': {
        color: '#B4B4B4',
        opacity: 1
      }
    }
  };

  // 라디오 그룹 스타일
  const radioGroupSx = {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    '& .MuiFormControlLabel-root': {
      '& .MuiFormControlLabel-label': {
        fontFamily: 'Pretendard',
        fontWeight: 500,
        fontSize: '16px',
        color: '#333'
      }
    }
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#CCE5FF',
      display: 'flex',  
      gap: 0,
      overflow: 'hidden'
    }}>
      {/* 사이드바 - Home.jsx와 완전히 동일 */}
      <Paper sx={{
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
        zIndex: 1000,
        boxShadow: 10
      }}>
        {/* 사용자 정보 영역 */}
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

        <List sx={{
          padding: '0 20px',
          flex: 1,
          '& .MuiListItem-root': {
            borderRadius: 1.5,
            marginBottom: 1,
            color: 'white',
            cursor: 'pointer',
            transition: theme => theme.transitions.create(['background-color', 'transform'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              transform: 'translateX(4px)'
            },
            '&.active': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          },
          '& .MuiListItemIcon-root': {
            color: 'white',
            minWidth: '40px',
          }
        }}>
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
                    navigate('/profile/management');
                  } else if (item.text === '보호 대상자') {
                    navigate('/seniors');
                  } else if (item.text === '일정 관리') {
                    navigate('/daily');
                  } else if (item.text === '설정') {
                    navigate('/settings');
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
        </List>

        {/* 로그아웃 버튼 */}
        <Box sx={{ px: 2 }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              color: 'white',
              cursor: 'pointer',
              transition: theme => theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.short,
              }),
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
      </Paper>

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        maxHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px',
          overflow: 'auto'
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: '900px',
            backgroundColor: 'transparent',
            padding: '40px',
            position: 'relative',
            minHeight: 'fit-content'
          }}>
            {/* 헤더 */}
            <Typography sx={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '32px',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              {isEditMode ? '보호 대상자 정보 수정' : '보호 대상자 정보 입력'}
            </Typography>

            {/* Figma와 동일한 테이블 형태 폼 */}
            <Box>
              {/* 이름 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC',
                borderTop: '4px solid #00458B'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  이름
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="seniorName"
                    value={formData.seniorName}
                    onChange={handleChange}
                    placeholder="ex) 홍길동"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 생년월일 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  생년월일
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                    <TextField
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      placeholder="ex) 19820909"
                      variant="outlined"
                      sx={{ ...textFieldSx, flex: 1 }}
                    />
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="calendarType"
                        value={formData.calendarType || '양력'}
                        onChange={handleChange}
                        sx={radioGroupSx}
                      >
                        <FormControlLabel value="음력" control={<Radio />} label="음력" />
                        <FormControlLabel value="양력" control={<Radio />} label="양력" />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              {/* 성별 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  성별
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <FormControl component="fieldset">
                    <RadioGroup
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      sx={radioGroupSx}
                    >
                      <FormControlLabel value="남성" control={<Radio />} label="남성" />
                      <FormControlLabel value="여성" control={<Radio />} label="여성" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>

              {/* 주소 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  주소
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="ex) 주소를 입력해주세요"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 보호 대상자 연락처 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  보호 대상자 연락처
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="ex) 01012345678"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 비상 연락처 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  비상 연락처
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="ex) 01012345678 (보호자, 가족, 이웃 등)"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 주요 지병 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  주요 지병
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    placeholder="ex) 주요 지병을 입력해주세요"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 복용중인 주요 약물 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  복용중인 주요 약물
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="ex) 복용중인 주요 약물이 있다면 입력해주세요"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>

              {/* 특이 사항 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000'
                }}>
                  특이 사항
                </Box>
                <Box sx={{
                  flex: 1,
                  height: '100%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}>
                  <TextField
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    placeholder="ex) 특이사항을 입력해주세요"
                    variant="outlined"
                    sx={textFieldSx}
                  />
                </Box>
              </Box>
            </Box>

            {/* 기기 연동 섹션 */}
            <Box sx={{ height: '8px', backgroundColor: '#0869CC', margin: '20px 0' }} />
            
            <Typography sx={{
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '24px',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              🔌 기기 연동 설정
            </Typography>

            <Box>
              {/* 혈압계 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '80px',
                borderBottom: '1px solid #0869CC',
                borderTop: '2px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  height: '100%',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000',
                  minHeight: '80px'
                }}>
                  🩺 혈압계
                </Box>
                <Box sx={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '16px 24px',
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.deviceSettings?.bloodPressureMonitor?.enabled || false}
                        onChange={(e) => handleDeviceChange('bloodPressureMonitor', 'enabled', e.target.checked)}
                      />
                    }
                    label="혈압계 연동 사용"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Pretendard', fontWeight: 500, fontSize: '16px' } }}
                  />
                  {formData.deviceSettings?.bloodPressureMonitor?.enabled && (
                    <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <TextField
                        placeholder="기기 모델명"
                        value={formData.deviceSettings?.bloodPressureMonitor?.deviceModel || ''}
                        onChange={(e) => handleDeviceChange('bloodPressureMonitor', 'deviceModel', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        placeholder="기기 ID"
                        value={formData.deviceSettings?.bloodPressureMonitor?.deviceId || ''}
                        onChange={(e) => handleDeviceChange('bloodPressureMonitor', 'deviceId', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>연결 방식</InputLabel>
                        <Select
                          value={formData.deviceSettings?.bloodPressureMonitor?.connectionType || 'bluetooth'}
                          onChange={(e) => handleDeviceChange('bloodPressureMonitor', 'connectionType', e.target.value)}
                          label="연결 방식"
                        >
                          <MenuItem value="bluetooth">블루투스</MenuItem>
                          <MenuItem value="wifi">WiFi</MenuItem>
                          <MenuItem value="usb">USB</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* 체온계 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '80px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000',
                  minHeight: '80px'
                }}>
                  🌡️ 체온계
                </Box>
                <Box sx={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.deviceSettings?.thermometer?.enabled || false}
                        onChange={(e) => handleDeviceChange('thermometer', 'enabled', e.target.checked)}
                      />
                    }
                    label="체온계 연동 사용"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Pretendard', fontWeight: 500, fontSize: '16px' } }}
                  />
                  {formData.deviceSettings?.thermometer?.enabled && (
                    <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <TextField
                        placeholder="기기 모델명"
                        value={formData.deviceSettings?.thermometer?.deviceModel || ''}
                        onChange={(e) => handleDeviceChange('thermometer', 'deviceModel', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        placeholder="기기 ID"
                        value={formData.deviceSettings?.thermometer?.deviceId || ''}
                        onChange={(e) => handleDeviceChange('thermometer', 'deviceId', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>연결 방식</InputLabel>
                        <Select
                          value={formData.deviceSettings?.thermometer?.connectionType || 'bluetooth'}
                          onChange={(e) => handleDeviceChange('thermometer', 'connectionType', e.target.value)}
                          label="연결 방식"
                        >
                          <MenuItem value="bluetooth">블루투스</MenuItem>
                          <MenuItem value="wifi">WiFi</MenuItem>
                          <MenuItem value="usb">USB</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* 혈당계 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '80px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000',
                  minHeight: '80px'
                }}>
                  🩸 혈당계
                </Box>
                <Box sx={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.deviceSettings?.glucometer?.enabled || false}
                        onChange={(e) => handleDeviceChange('glucometer', 'enabled', e.target.checked)}
                      />
                    }
                    label="혈당계 연동 사용"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Pretendard', fontWeight: 500, fontSize: '16px' } }}
                  />
                  {formData.deviceSettings?.glucometer?.enabled && (
                    <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <TextField
                        placeholder="기기 모델명"
                        value={formData.deviceSettings?.glucometer?.deviceModel || ''}
                        onChange={(e) => handleDeviceChange('glucometer', 'deviceModel', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        placeholder="기기 ID"
                        value={formData.deviceSettings?.glucometer?.deviceId || ''}
                        onChange={(e) => handleDeviceChange('glucometer', 'deviceId', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>연결 방식</InputLabel>
                        <Select
                          value={formData.deviceSettings?.glucometer?.connectionType || 'bluetooth'}
                          onChange={(e) => handleDeviceChange('glucometer', 'connectionType', e.target.value)}
                          label="연결 방식"
                        >
                          <MenuItem value="bluetooth">블루투스</MenuItem>
                          <MenuItem value="wifi">WiFi</MenuItem>
                          <MenuItem value="usb">USB</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* 산소포화도계 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '80px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000',
                  minHeight: '80px'
                }}>
                  📊 산소포화도계
                </Box>
                <Box sx={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.deviceSettings?.pulseOximeter?.enabled || false}
                        onChange={(e) => handleDeviceChange('pulseOximeter', 'enabled', e.target.checked)}
                      />
                    }
                    label="산소포화도계 연동 사용"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Pretendard', fontWeight: 500, fontSize: '16px' } }}
                  />
                  {formData.deviceSettings?.pulseOximeter?.enabled && (
                    <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <TextField
                        placeholder="기기 모델명"
                        value={formData.deviceSettings?.pulseOximeter?.deviceModel || ''}
                        onChange={(e) => handleDeviceChange('pulseOximeter', 'deviceModel', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        placeholder="기기 ID"
                        value={formData.deviceSettings?.pulseOximeter?.deviceId || ''}
                        onChange={(e) => handleDeviceChange('pulseOximeter', 'deviceId', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>연결 방식</InputLabel>
                        <Select
                          value={formData.deviceSettings?.pulseOximeter?.connectionType || 'bluetooth'}
                          onChange={(e) => handleDeviceChange('pulseOximeter', 'connectionType', e.target.value)}
                          label="연결 방식"
                        >
                          <MenuItem value="bluetooth">블루투스</MenuItem>
                          <MenuItem value="wifi">WiFi</MenuItem>
                          <MenuItem value="usb">USB</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* 웨어러블 디바이스 */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '80px',
                borderBottom: '1px solid #0869CC'
              }}>
                <Box sx={{
                  width: '200px',
                  backgroundColor: 'rgba(51, 153, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#000000',
                  minHeight: '80px'
                }}>
                  ⌚ 웨어러블
                </Box>
                <Box sx={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.deviceSettings?.wearableDevice?.enabled || false}
                        onChange={(e) => handleDeviceChange('wearableDevice', 'enabled', e.target.checked)}
                      />
                    }
                    label="웨어러블 디바이스 연동 사용"
                    sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Pretendard', fontWeight: 500, fontSize: '16px' } }}
                  />
                  {formData.deviceSettings?.wearableDevice?.enabled && (
                    <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <TextField
                        placeholder="기기 모델명"
                        value={formData.deviceSettings?.wearableDevice?.deviceModel || ''}
                        onChange={(e) => handleDeviceChange('wearableDevice', 'deviceModel', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        placeholder="기기 ID"
                        value={formData.deviceSettings?.wearableDevice?.deviceId || ''}
                        onChange={(e) => handleDeviceChange('wearableDevice', 'deviceId', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>연결 방식</InputLabel>
                        <Select
                          value={formData.deviceSettings?.wearableDevice?.connectionType || 'bluetooth'}
                          onChange={(e) => handleDeviceChange('wearableDevice', 'connectionType', e.target.value)}
                          label="연결 방식"
                        >
                          <MenuItem value="bluetooth">블루투스</MenuItem>
                          <MenuItem value="wifi">WiFi</MenuItem>
                          <MenuItem value="usb">USB</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* 버튼 영역 */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '40px'
            }}>
              {/* 등록/수정 버튼 */}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                sx={{
                  width: '200px',
                  height: '60px',
                  backgroundColor: '#0869CC',
                  borderRadius: '30px',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#0653A3'
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc'
                  }
                }}
              >
                {loading ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '수정하기' : '등록하기')}
              </Button>
              
              {/* 돌아가기 버튼 */}
              <Button
                variant="outlined"
                onClick={() => navigate('/seniors')}
                sx={{
                  width: '200px',
                  height: '60px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '30px',
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#0869CC',
                  textTransform: 'none',
                  border: '2px solid #0869CC',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                    border: '2px solid #0653A3'
                  }
                }}
              >
                돌아가기
              </Button>
            </Box>

            {/* 메시지 표시 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2, maxWidth: '600px', margin: '20px auto 0 auto' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2, maxWidth: '600px', margin: '20px auto 0 auto' }}>
                {success}
              </Alert>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Sjoinpage;