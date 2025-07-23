import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert
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
import { getUserInfo, clearAuthData, getToken } from '../../utils/auth';

const Setting = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('설정');
  const [currentTab, setCurrentTab] = useState(0);
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
    medicationAlarm: {
      enabled: true,
      medicationType: '혈압약',
      hour: '08',
      minute: '00'
    },
    healthCheckAlarm: true,
    weatherAlarm: true,
    guardianAlarm: true
  });

  // 모니터링 설정 상태
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
    }
  });

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 백엔드에서 모니터링 설정 조회
  const fetchMonitoringSettings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('/api/monitoring-settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드 데이터를 프론트엔드 구조로 변환
        setMonitoringSettings({
          bloodPressure: {
            attentionMax: data.bloodPressureAttentionMax,
            attentionMin: data.bloodPressureAttentionMin,
            cautionMax: data.bloodPressureCautionMax,
            cautionMin: data.bloodPressureCautionMin,
            diastolicAttentionMax: data.diastolicAttentionMax,
            diastolicAttentionMin: data.diastolicAttentionMin,
            diastolicCautionMax: data.diastolicCautionMax,
            diastolicCautionMin: data.diastolicCautionMin
          },
          heartRate: {
            attentionMax: data.heartRateAttentionMax,
            attentionMin: data.heartRateAttentionMin,
            cautionMax: data.heartRateCautionMax,
            cautionMin: data.heartRateCautionMin
          },
          bodyTemperature: {
            attentionMax: data.bodyTemperatureAttentionMax,
            attentionMin: data.bodyTemperatureAttentionMin,
            cautionMax: data.bodyTemperatureCautionMax,
            cautionMin: data.bodyTemperatureCautionMin
          },
          bloodSugar: {
            attentionMax: data.bloodSugarAttentionMax,
            attentionMin: data.bloodSugarAttentionMin,
            cautionMax: data.bloodSugarCautionMax,
            cautionMin: data.bloodSugarCautionMin
          }
        });
      } else {
        throw new Error('설정을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('모니터링 설정 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 백엔드에 모니터링 설정 저장
  const saveMonitoringSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      // 프론트엔드 구조를 백엔드 구조로 변환
      const requestData = {
        bloodPressureAttentionMax: monitoringSettings.bloodPressure.attentionMax,
        bloodPressureAttentionMin: monitoringSettings.bloodPressure.attentionMin,
        bloodPressureCautionMax: monitoringSettings.bloodPressure.cautionMax,
        bloodPressureCautionMin: monitoringSettings.bloodPressure.cautionMin,
        diastolicAttentionMax: monitoringSettings.bloodPressure.diastolicAttentionMax,
        diastolicAttentionMin: monitoringSettings.bloodPressure.diastolicAttentionMin,
        diastolicCautionMax: monitoringSettings.bloodPressure.diastolicCautionMax,
        diastolicCautionMin: monitoringSettings.bloodPressure.diastolicCautionMin,
        heartRateAttentionMax: monitoringSettings.heartRate.attentionMax,
        heartRateAttentionMin: monitoringSettings.heartRate.attentionMin,
        heartRateCautionMax: monitoringSettings.heartRate.cautionMax,
        heartRateCautionMin: monitoringSettings.heartRate.cautionMin,
        bodyTemperatureAttentionMax: monitoringSettings.bodyTemperature.attentionMax,
        bodyTemperatureAttentionMin: monitoringSettings.bodyTemperature.attentionMin,
        bodyTemperatureCautionMax: monitoringSettings.bodyTemperature.cautionMax,
        bodyTemperatureCautionMin: monitoringSettings.bodyTemperature.cautionMin,
        bloodSugarAttentionMax: monitoringSettings.bloodSugar.attentionMax,
        bloodSugarAttentionMin: monitoringSettings.bloodSugar.attentionMin,
        bloodSugarCautionMax: monitoringSettings.bloodSugar.cautionMax,
        bloodSugarCautionMin: monitoringSettings.bloodSugar.cautionMin
      };

      const response = await fetch('/api/monitoring-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setSuccess('설정이 성공적으로 저장되었습니다.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('설정 저장에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('모니터링 설정 저장 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringSettings();
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
    { label: '모니터링 설정', icon: MonitorHeartOutlined },
    { label: '디바이스 연결', icon: DevicesOutlined },
    { label: '화면 / 접근성 설정', icon: AccessibilityOutlined },
    { label: '비상 연락 / 보호자', icon: ContactsOutlined },
    { label: '보안 및 로그인', icon: LockOutlined }
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

  const handleMedicationSettingChange = (field) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      medicationAlarm: {
        ...prev.medicationAlarm,
        [field]: event.target.value
      }
    }));
  };

  // 모니터링 설정 변경 핸들러
  const handleMonitoringSettingChange = (category, field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setMonitoringSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // 모니터링 설정 초기화
  const resetMonitoringSettings = () => {
    setMonitoringSettings({
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
      }
    });
  };

  // 알림 설정 탭 컨텐츠
  const renderNotificationSettings = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#000' }}>
        알림
      </Typography>
      
      {/* 약 복용 알림 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #D7D7D7', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            약 복용 알림
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body1">약 종류:</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={notificationSettings.medicationAlarm.medicationType}
              onChange={handleMedicationSettingChange('medicationType')}
              sx={{ backgroundColor: 'white', border: '1px solid #00458B', borderRadius: 1 }}
            >
              <MenuItem value="혈압약">혈압약</MenuItem>
              <MenuItem value="당뇨약">당뇨약</MenuItem>
              <MenuItem value="심장약">심장약</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body1">시간:</Typography>
          <FormControl size="small" sx={{ minWidth: 70 }}>
            <Select
              value={notificationSettings.medicationAlarm.hour}
              onChange={handleMedicationSettingChange('hour')}
              sx={{ backgroundColor: 'white', border: '1px solid #00458B', borderRadius: 1 }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <MenuItem key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body1">시</Typography>
          
          <FormControl size="small" sx={{ minWidth: 70 }}>
            <Select
              value={notificationSettings.medicationAlarm.minute}
              onChange={handleMedicationSettingChange('minute')}
              sx={{ backgroundColor: 'white', border: '1px solid #00458B', borderRadius: 1 }}
            >
              {['00', '15', '30', '45'].map((min) => (
                <MenuItem key={min} value={min}>
                  {min}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body1">분</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

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

  // 모니터링 설정 탭 컨텐츠
  const renderMonitoringSettings = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#000' }}>
        모니터링 설정
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
          이 설정은 참고용입니다. 정확한 진단은 반드시 의료진과 상담하세요.
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
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.attentionMin}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'attentionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 31 }, (_, i) => 80 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.attentionMax}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'attentionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 41 }, (_, i) => 160 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치 (수축기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.cautionMin}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'cautionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 95 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.cautionMax}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'cautionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 130 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ff9800' }}>
              주의 수치 (이완기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.diastolicAttentionMin}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicAttentionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 50 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.diastolicAttentionMax}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicAttentionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 31 }, (_, i) => 100 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치 (이완기)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.diastolicCautionMin}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicCautionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 16 }, (_, i) => 60 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.bloodPressure.diastolicCautionMax}
                  onChange={handleMonitoringSettingChange('bloodPressure', 'diastolicCautionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 16 }, (_, i) => 85 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.heartRate.attentionMin}
                  onChange={handleMonitoringSettingChange('heartRate', 'attentionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 40 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.heartRate.attentionMax}
                  onChange={handleMonitoringSettingChange('heartRate', 'attentionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 41 }, (_, i) => 90 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2196f3' }}>
              관찰 수치
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.heartRate.cautionMin}
                  onChange={handleMonitoringSettingChange('heartRate', 'cautionMin')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 50 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2">~</Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={monitoringSettings.heartRate.cautionMax}
                  onChange={handleMonitoringSettingChange('heartRate', 'cautionMax')}
                  sx={{ backgroundColor: 'white' }}
                >
                  {Array.from({ length: 21 }, (_, i) => 80 + i).map(val => (
                    <MenuItem key={val} value={val}>{val}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
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
          onClick={saveMonitoringSettings}
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
      case 5:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              보안 및 로그인
            </Typography>
            <Typography variant="body1" color="text.secondary">
              보안 및 로그인 설정 기능이 준비 중입니다.
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
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
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
