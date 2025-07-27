import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,  
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,  
  Tabs,
  Tab,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  TextField
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,
  SecurityOutlined,
  EventOutlined,
  LogoutOutlined,
  SettingsOutlined,
  EditOutlined,
  NotificationsOutlined,
  DevicesOutlined,
  AccessibilityOutlined,
  ContactsOutlined,
  LockOutlined,
  MonitorHeartOutlined
} from '@mui/icons-material';
import userImage from '../../images/user.png';
import { getUserInfo, clearAuthData } from '../../utils/auth';
import UserSettingService from '../../services/userSettingService';

const Setting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 탭 번호 읽기
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl ? parseInt(tabFromUrl, 10) : 0;
  
  const [activeMenu, setActiveMenu] = useState('설정');
  const [currentTab, setCurrentTab] = useState(initialTab);
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

  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState({
    healthCheckAlarm: true,
    weatherAlarm: true,
    guardianAlarm: true
  });

  // 바이탈 사인 설정 상태
  const [monitoringSettings, setMonitoringSettings] = useState({
    bloodPressure: {
      attentionMax: 180,
      attentionMin: 90,
      cautionMax: 140,
      cautionMin: 100,
      diastolicAttentionMax: 110,
      diastolicAttentionMin: 60,
      diastolicCautionMax: 90,
      diastolicCautionMin: 65
    },
    heartRate: {
      attentionMax: 100,
      attentionMin: 50,
      cautionMax: 90,
      cautionMin: 60
    },
    bodyTemperature: {
      attentionMax: 38.0,
      attentionMin: 35.5,
      cautionMax: 37.5,
      cautionMin: 36.0
    },
    bloodSugar: {
      attentionMax: 250,
      attentionMin: 70,
      cautionMax: 180,
      cautionMin: 80
    },
    // 새로 추가: 의료진 진료 알림 기준
    alertSettings: {
      attentionRatioThreshold: 10,    // 의료진 상담 권장 비율 (%)
      cautionRatioThreshold: 30,      // 계속 관찰 필요 비율 (%)
      attentionCountThreshold: 3,     // 위험 횟수 기준
      cautionCountThreshold: 5,       // 주의 횟수 기준
      emergencyCountThreshold: 1,     // 즉시 알림 응급 횟수
      useRatioThreshold: true,        // 비율 기준 사용 여부
      useCountThreshold: true,        // 횟수 기준 사용 여부
      useEmergencyAlert: true         // 즉시 알림 사용 여부
    }
  });

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // URL 파라미터가 변경될 때 탭 업데이트
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      const tabNumber = parseInt(tabFromUrl, 10);
      if (tabNumber >= 0 && tabNumber < settingTabs.length) {
        setCurrentTab(tabNumber);
        console.log('탭 이동:', settingTabs[tabNumber].label);
        
        // 바이탈 사인 설정 탭(1)으로 이동 시 알림 섹션으로 스크롤
        if (tabNumber === 1) {
          setTimeout(() => {
            const alertSection = document.getElementById('alert-settings-section');
            if (alertSection) {
              alertSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              console.log('알림 섹션으로 스크롤 완료');
            }
          }, 500); // 탭 전환 후 0.5초 대기
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // 백엔드에서 바이탈 사인 설정 불러오기
    const loadVitalSignSettings = async () => {
      try {
        setLoading(true);
        const userInfo = getUserInfo();
        console.log('🚀 loadVitalSignSettings 시작 - 사용자 정보:', userInfo);
        
        if (userInfo && userInfo.guardianId) {
          console.log('🔍 UserSettingService.getVitalSignSettings 호출:', userInfo.guardianId);
          const settings = await UserSettingService.getVitalSignSettings(userInfo.guardianId);
          console.log('✅ 바이탈 사인 설정 로드 완료:', settings);
          setMonitoringSettings(settings);
          console.log('📦 monitoringSettings state 업데이트 완료');
        } else {
          console.warn('guardianId가 없어 기본 설정을 사용합니다.');
          console.log('사용자 정보:', userInfo);
          const defaultSettings = UserSettingService.getDefaultVitalSignSettings();
          setMonitoringSettings(defaultSettings);
        }
      } catch (error) {
        console.error('바이탈 사인 설정 로드 실패:', error);
        setError('설정을 불러오는데 실패했습니다. 기본 설정을 사용합니다.');
        const defaultSettings = UserSettingService.getDefaultVitalSignSettings();
        setMonitoringSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadVitalSignSettings();
  }, []);

  const handleLogout = () => {
    clearAuthData();
    alert('로그아웃 되었습니다.');
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

  const settingTabs = [
    { label: '알림', icon: NotificationsOutlined },
    { label: '바이탈 사인 설정', icon: MonitorHeartOutlined },
    { label: '디바이스 연결', icon: DevicesOutlined },
    { label: '화면 / 접근성 설정', icon: AccessibilityOutlined },
    { label: '비상 연락 / 보호자', icon: ContactsOutlined }    
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSwitchChange = (setting) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  // 바이탈 사인 설정 변경 핸들러 (TextField용)
  const handleMonitoringSettingChange = (category, field) => (event) => {
    const value = event.target.value;
    // 비어있지 않을 때만 숫자로 변환
    const numericValue = value === '' ? '' : parseFloat(value);
    
    setMonitoringSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numericValue
      }
    }));
  };

  // 바이탈 사인 설정 초기화 (알림 설정 포함)
  const resetMonitoringSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 기본값으로 리셋
      const defaultSettings = UserSettingService.getDefaultVitalSignSettings();
      setMonitoringSettings(defaultSettings);
      
      // 사용자가 있으면 백엔드에도 저장
      const userInfo = getUserInfo();
      if (userInfo && userInfo.guardianId) {
        await UserSettingService.saveVitalSignSettings(userInfo.guardianId, defaultSettings);
        console.log('기본 설정으로 초기화 완료');
      }
      
      // localStorage에도 저장
      localStorage.setItem('monitoringSettings', JSON.stringify(defaultSettings));
      
      // 기본값 리셋 시에도 이벤트 발생
      setTimeout(() => {
        window.dispatchEvent(new Event('monitoringSettingsChanged'));
      }, 100);
      
      setSuccess('기본값으로 초기화되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('초기화 실패:', error);
      setError('초기화에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 알림 설정 변경 핸들러
  const handleAlertSettingChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
    
    setMonitoringSettings(prev => ({
      ...prev,
      alertSettings: {
        ...prev.alertSettings,
        [field]: value
      }
    }));
  };

  // 알림 설정 탭 컨텐츠
  const renderNotificationSettings = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#000' }}>
        알림
      </Typography>
      
      {/* 건강 체크 알림 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            건강 체크 알림
          </Typography>
          <Typography variant="body2" color="text.secondary">
            정해진 시간에 건강 상태 확인 알림을 드려, 정기적인 관리에 도움이 됩니다.
          </Typography>
        </Box>
        <Switch
          checked={notificationSettings.healthCheckAlarm}
          onChange={handleSwitchChange('healthCheckAlarm')}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#1976d2'
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#1976d2'
            }
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 날씨 기반 알림 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            날씨 기반 알림
          </Typography>
          <Typography variant="body2" color="text.secondary">
            폭염·한파 특보 시 건강 수칙을 안내해 안전한 대응을 도와드립니다.
          </Typography>
        </Box>
        <Switch
          checked={notificationSettings.weatherAlarm}
          onChange={handleSwitchChange('weatherAlarm')}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#1976d2'
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#1976d2'
            }
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 보호자 알림 여부 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            보호자 알림 여부
          </Typography>
          <Typography variant="body2" color="text.secondary">
            낙상·이상 징후 등 응급 상황 발생 시 보호자에게 빠르게 알림을 전송합니다.
          </Typography>
        </Box>
        <Switch
          checked={notificationSettings.guardianAlarm}
          onChange={handleSwitchChange('guardianAlarm')}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#1976d2'
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#1976d2'
            }
          }}
        />
      </Box>
    </Box>
  );

  // 바이탈 사인 설정 탭 컨텐츠
  const renderMonitoringSettings = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#000' }}>
        바이탈 사인 설정
      </Typography>
      
      {/* 에러 및 성공 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#856404' }}>
          ⚠️ 주의사항
        </Typography>
        <Typography variant="body2" sx={{ color: '#856404' }}>
          초기 설정은 참고용입니다. 정확한 진단은 반드시 의료진과 상담 후 설정하세요.
        </Typography>
      </Box>

      {/* 혈압 설정 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #D7D7D7', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
          🩸 혈압 기준 (mmHg)
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치 (수축기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.attentionMin}
                onChange={handleMonitoringSettingChange('bloodPressure', 'attentionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 50, max: 200 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.attentionMax}
                onChange={handleMonitoringSettingChange('bloodPressure', 'attentionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 100, max: 250 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치 (수축기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.cautionMin}
                onChange={handleMonitoringSettingChange('bloodPressure', 'cautionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 80, max: 150 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.cautionMax}
                onChange={handleMonitoringSettingChange('bloodPressure', 'cautionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 120, max: 180 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치 (이완기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.diastolicAttentionMin}
                onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicAttentionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 40, max: 90 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.diastolicAttentionMax}
                onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicAttentionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 90, max: 130 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치 (이완기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.diastolicCautionMin}
                onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicCautionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 50, max: 85 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodPressure.diastolicCautionMax}
                onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicCautionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 80, max: 110 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 심박수 설정 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #D7D7D7', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
          💓 심박수 기준 (bpm)
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.heartRate.attentionMin}
                onChange={handleMonitoringSettingChange('heartRate', 'attentionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 30, max: 80 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.heartRate.attentionMax}
                onChange={handleMonitoringSettingChange('heartRate', 'attentionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 90, max: 150 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.heartRate.cautionMin}
                onChange={handleMonitoringSettingChange('heartRate', 'cautionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 40, max: 80 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.heartRate.cautionMax}
                onChange={handleMonitoringSettingChange('heartRate', 'cautionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 80, max: 120 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 체온 설정 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #D7D7D7', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
          🌡️ 체온 기준 (°C)
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bodyTemperature.attentionMin}
                onChange={handleMonitoringSettingChange('bodyTemperature', 'attentionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 34, max: 37, step: 0.1 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bodyTemperature.attentionMax}
                onChange={handleMonitoringSettingChange('bodyTemperature', 'attentionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 37, max: 41, step: 0.1 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bodyTemperature.cautionMin}
                onChange={handleMonitoringSettingChange('bodyTemperature', 'cautionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 35, max: 37, step: 0.1 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bodyTemperature.cautionMax}
                onChange={handleMonitoringSettingChange('bodyTemperature', 'cautionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 37, max: 39, step: 0.1 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 혈당 설정 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #D7D7D7', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
          🩸 혈당 기준 (mg/dL)
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodSugar.attentionMin}
                onChange={handleMonitoringSettingChange('bloodSugar', 'attentionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 50, max: 100 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodSugar.attentionMax}
                onChange={handleMonitoringSettingChange('bloodSugar', 'attentionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 200, max: 400 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodSugar.cautionMin}
                onChange={handleMonitoringSettingChange('bloodSugar', 'cautionMin')}
                sx={{ width: 80 }}
                inputProps={{ min: 60, max: 100 }}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                size="small"
                type="number"
                value={monitoringSettings.bloodSugar.cautionMax}
                onChange={handleMonitoringSettingChange('bloodSugar', 'cautionMax')}
                sx={{ width: 80 }}
                inputProps={{ min: 140, max: 250 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 새로 추가: 의료진 진료 알림 설정 */}
      <Box 
        id="alert-settings-section"
        sx={{ 
          mb: 4, 
          p: 3, 
          border: '2px solid #1976d2', 
          borderRadius: 2, 
          backgroundColor: '#f5f9ff',
          // URL에서 tab=1로 올 때 강조 효과
          ...(searchParams.get('tab') === '1' && {
            animation: 'highlight 2s ease-in-out',
            '@keyframes highlight': {
              '0%': { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
              '50%': { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
              '100%': { backgroundColor: '#f5f9ff', borderColor: '#1976d2' }
            }
          })
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', color: '#1976d2' }}>
          🏥 의료진 진료 알림 기준
        </Typography>
        
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#1565c0' }}>
            💡 알림 기준 설명
          </Typography>
          <Typography variant="body2" sx={{ color: '#1565c0' }}>
            측정값의 비율이나 연속 횟수를 기준으로 의료진 상담이 필요한 시점을 자동으로 판단합니다.
          </Typography>
        </Box>

        {/* 비율 기준 설정 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#d32f2f' }}>
            📊 비율 기준 알림
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {/* 의료진 상담 권장 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                🚨 의료진 상담 권장
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  value={monitoringSettings.alertSettings.attentionRatioThreshold}
                  onChange={handleAlertSettingChange('attentionRatioThreshold')}
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, max: 50 }}
                />
                <Typography variant="body2">% 이상</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                위험 수치가 전체의 {monitoringSettings.alertSettings.attentionRatioThreshold}% 이상일 때
              </Typography>
            </Box>

            {/* 계속 관찰 필요 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                👀 계속 관찰 필요
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  value={monitoringSettings.alertSettings.cautionRatioThreshold}
                  onChange={handleAlertSettingChange('cautionRatioThreshold')}
                  sx={{ width: 80 }}
                  inputProps={{ min: 10, max: 80 }}
                />
                <Typography variant="body2">% 이상</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                주의 수치가 전체의 {monitoringSettings.alertSettings.cautionRatioThreshold}% 이상일 때
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 횟수 기준 설정 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
            🔢 횟수 기준 알림
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
            {/* 위험 횟수 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                위험 횟수 기준
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  value={monitoringSettings.alertSettings.attentionCountThreshold}
                  onChange={handleAlertSettingChange('attentionCountThreshold')}
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, max: 20 }}
                />
                <Typography variant="body2">회 이상</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                위험 수치 연속 {monitoringSettings.alertSettings.attentionCountThreshold}회 → 상담 권장
              </Typography>
            </Box>

            {/* 주의 횟수 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                주의 횟수 기준
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  value={monitoringSettings.alertSettings.cautionCountThreshold}
                  onChange={handleAlertSettingChange('cautionCountThreshold')}
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, max: 30 }}
                />
                <Typography variant="body2">회 이상</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                주의 수치 연속 {monitoringSettings.alertSettings.cautionCountThreshold}회 → 관찰 필요
              </Typography>
            </Box>

            {/* 즉시 알림 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#f57c00' }}>
                ⚡ 즉시 알림
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  value={monitoringSettings.alertSettings.emergencyCountThreshold}
                  onChange={handleAlertSettingChange('emergencyCountThreshold')}
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, max: 5 }}
                />
                <Typography variant="body2">회 발생</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                응급 상황 {monitoringSettings.alertSettings.emergencyCountThreshold}회 → 즉시 알림
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 현재 설정 요약 */}
        <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1976d2' }}>
            📋 현재 알림 기준 요약
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#d32f2f' }}>
              🚨 의료진 상담: 위험 비율 {monitoringSettings.alertSettings.attentionRatioThreshold}% 이상 또는 위험 {monitoringSettings.alertSettings.attentionCountThreshold}회 이상
            </Typography>
            <Typography variant="caption" sx={{ color: '#1976d2' }}>
              👀 계속 관찰: 주의 비율 {monitoringSettings.alertSettings.cautionRatioThreshold}% 이상 또는 주의 {monitoringSettings.alertSettings.cautionCountThreshold}회 이상
            </Typography>
            <Typography variant="caption" sx={{ color: '#f57c00' }}>
              ⚡ 즉시 알림: 응급 상황 {monitoringSettings.alertSettings.emergencyCountThreshold}회 발생 시
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 저장 및 초기화 버튼 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={resetMonitoringSettings}
          sx={{ fontWeight: 'bold' }}
          disabled={loading}
        >
          기본값으로 초기화
        </Button>
        <Button
          variant="contained"
          sx={{ fontWeight: 'bold', backgroundColor: '#1976d2' }}
  // 바이탈 사인 설정 저장 버튼 클릭 이벤트
          onClick={async () => {
            try {
              setLoading(true);
              setError(null);
              
              const userInfo = getUserInfo();
              console.log('사용자 정보:', userInfo);
              
              if (!userInfo || !userInfo.guardianId) {
                throw new Error('사용자 정보를 찾을 수 없습니다.');
              }

              console.log('바이탈 사인 설정 저장 시작:', {
                guardianId: userInfo.guardianId,
                settings: monitoringSettings
              });

              // 백엔드 API 호출로 설정 저장
              await UserSettingService.saveVitalSignSettings(userInfo.guardianId, monitoringSettings);
              
              // localStorage에도 백업 저장 (오프라인 대응)
              localStorage.setItem('monitoringSettings', JSON.stringify(monitoringSettings));
              
              // 커스텀 이벤트 발생으로 다른 컴포넌트에 알림
              window.dispatchEvent(new Event('monitoringSettingsChanged'));
              
              setSuccess('바이탈 사인 설정 및 알림 설정이 모두 저장되었습니다.');
              setTimeout(() => setSuccess(null), 3000);
              
              console.log('바이탈 사인 설정 저장 완료:', monitoringSettings);
            } catch (error) {
              console.error('바이탈 사인 설정 저장 실패:', error);
              setError(error.message || '설정 저장에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? '저장 중...' : '설정 저장'}
        </Button>
      </Box>
    </Box>
  );

  // 다른 탭들의 기본 컨텐츠
  const renderTabContent = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return renderNotificationSettings();
      case 1:
        return renderMonitoringSettings();
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              디바이스 연결
            </Typography>
            <Typography variant="body1" color="text.secondary">
              디바이스 연결 설정 기능이 준비 중입니다.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              화면 / 접근성 설정
            </Typography>
            <Typography variant="body1" color="text.secondary">
              화면 및 접근성 설정 기능이 준비 중입니다.
            </Typography>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              비상 연락 / 보호자
            </Typography>
            <Typography variant="body1" color="text.secondary">
              비상 연락처 설정 기능이 준비 중입니다.
            </Typography>
          </Box>
        );      
      default:
        return null;
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
      {/* 왼쪽 사이드바 */}
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
                    setActiveMenu(item.text);
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

      {/* 메인 콘텐츠 영역 */}
      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
        borderRadius: 2
      }}>
        {/* 헤더 */}
        <Box sx={{ p: '30px', borderBottom: '1px solid #e0e0e0' }}>
          <Typography sx={{ 
            fontFamily: 'Pretendard',
            fontWeight: 700,
            fontSize: '28px',
            color: '#1976d2',
            mb: 3 
          }}>
            설정
          </Typography>
          
          {/* 설정 탭 */}
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#000',
                '&.Mui-selected': {
                  color: '#1976d2'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2'
              }
            }}
          >
            {settingTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* 설정 내용 */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#FDFDFD',
          border: '1px solid #D7D7D7'
        }}>
          {renderTabContent(currentTab)}
        </Box>
      </Paper>
    </Box>
  );
};

export default Setting;
