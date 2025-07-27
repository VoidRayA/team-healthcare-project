import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,  
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  MenuItem,
  Select,
  FormControl,  
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Container,
  TableSortLabel
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleOutlined,  
  EventOutlined,
  LogoutOutlined,
  EditOutlined,
  SettingsOutlined,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import userImage from '../../images/user.png';
// import PasswordConfirmModal from './PasswordConfirmModal'; // ProfileManagement에서만 사용
import SeniorSelectModal from '../modals/SeniorSelectModal';
import CategoryManageModal from '../modals/CategoryManageModal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getUserInfo, clearAuthData, getAuthToken } from '../../utils/auth';

// 한국 시간 기준 날짜 문자열 변환 함수
const getKoreanDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Daily = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('일정 관리');
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
  
  // 스크롤 위치 유지를 위한 ref (현재는 사용하지 않지만 추후 필요시 활용 가능)
  const seniorTableRef = useRef(null);
  
  // 상태 관리
  const [seniors, setSeniors] = useState([]);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false); // 일정 로딩 상태 추가
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [showPasswordModal, setShowPasswordModal] = useState(false); // ProfileManagement에서만 처리
  const [showSeniorSelectModal, setShowSeniorSelectModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10; // 페이지당 항목 수
  
  // 정렬 관련 상태 - 각 테이블별로 분리
  const [seniorSortColumn, setSeniorSortColumn] = useState('');
  const [seniorSortDirection, setSeniorSortDirection] = useState('asc');
  const [activitySortColumn, setActivitySortColumn] = useState('');
  const [activitySortDirection, setActivitySortDirection] = useState('asc');
  
  // 드롭다운 관련 상태
  const [dropdownItems, setDropdownItems] = useState(['식사', '운동', '약물복용', '외출', '휴식', '기타']); // 기본값 설정
  const [selectedItems, setSelectedItems] = useState({
    '식사': '',
    '운동': '',
    '약물복용': '',
    '외출': '',
    '휴식': '',
    '기타': ''
  }); // 기본값도 초기화
  
  // 수정 관련 상태 추가
  const [isEditing, setIsEditing] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  
  // 폼 데이터 (기존 체크박스용)
  const [formData, setFormData] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    sleepQuality: '',
    specialNotes: ''
  });

  useEffect(() => {
    // 보호 대상자 목록 로드
    loadSeniors();
    // 드롭다운 데이터 로드
    fetchDropdownData();
      // 초기에는 일정 데이터를 로드하지 않음 (보호대상자와 날짜가 선택되면 로드)
    // fetchDailyActivities();
  }, []);

  // dropdownItems가 변경될 때 selectedItems 초기화
  useEffect(() => {
    if (dropdownItems.length > 0) {
      const initialSelected = {};
      dropdownItems.forEach(item => {
        initialSelected[item] = '';
      });
      setSelectedItems(initialSelected);
      console.log('드롭다운 아이템 변경으로 selectedItems 초기화:', initialSelected);
    }
  }, [dropdownItems]);

  // 정렬 함수 - displayedSeniors보다 먼저 정의해야 함
  const sortSeniors = useCallback((data, column, direction) => {
    if (!column || !data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      // isEmpty인 항목은 항상 마지막에 위치
      if (a.isEmpty) return 1;
      if (b.isEmpty) return -1;
      
      let aValue = a[column] || '';
      let bValue = b[column] || '';
      
      // 나이의 경우 숫자로 비교
      if (column === 'age') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  const sortDailyActivites = useCallback((data, column, direction) => {
    if (!column || !data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      // isEmpty인 항목은 항상 마지막에 위치
      if (a.isEmpty) return 1;
      if (b.isEmpty) return -1;
      
      let aValue = a[column] || '';
      let bValue = b[column] || '';
      
      // 나이의 경우 숫자로 비교
      if (column === 'age') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // seniors가 변경될 때마다 displayedSeniors 업데이트
  const displayedSeniors = useMemo(() => {
    // 정렬이 필요한 경우만 정렬 수행
    const sorted = seniorSortColumn ? sortSeniors(seniors, seniorSortColumn, seniorSortDirection) : [...seniors];
    
    // 현재 페이지의 데이터만 사용 (이미 API에서 페이지네이션되어 온 데이터)
    const displayed = [...sorted];
    
    // 현재 페이지에서 10개가 안되면 빈 행 추가 (마지막 페이지에서만)
    while (displayed.length < pageSize) {
      displayed.push({ 
        id: `empty-${displayed.length}`, 
        isEmpty: true,
        seniorName: '', 
        age: '',  // 나이 필드 추가
        phoneNumber: '', 
        address: '', 
        emergencyContact: '', 
        medicalConditions: '', 
        medications: '', 
        specialNotes: '' 
      });
    }
    
    return displayed;
  }, [seniors, seniorSortColumn, seniorSortDirection, sortSeniors, pageSize]);

  // 일정 관리 데이터 로드 함수
  const fetchDailyActivities = async (seniorId, date) => {
    try {
      setActivitiesLoading(true); // 일정 로딩 시작
      const token = getAuthToken();
      
      if (!seniorId || !date) {
        console.warn('보호대상자 ID 또는 날짜가 없습니다.');
        setDailyActivities([]);
        return;
      }

      const dateString = getKoreanDateString(date); // 한국 시간 기준
      
      if (!token) {
        console.log('JWT 토큰이 없습니다.');
        setDailyActivities([]);
        return;
      }

      // 실제 API 호출
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${seniorId}/dailyActivities?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('일정 데이터 로드 성공:', data);
        console.log('데이터 타입:', typeof data);
        console.log('데이터 구조:', Object.keys(data));
        console.log('전체 데이터 JSON:', JSON.stringify(data, null, 2));
        
        // API 응답이 배열인지 객체인지에 따라 처리
        let activitiesArray = [];
        
        if (Array.isArray(data)) {
          console.log('데이터가 배열입니다.');
          activitiesArray = data;
        } else if (data && data.dailyActivities && Array.isArray(data.dailyActivities)) {
          console.log('데이터가 dailyActivities 구조입니다.');
          // 새로운 SeniorDailyDto 구조에서 dailyActivities 추출
          activitiesArray = data.dailyActivities;
        } else if (data && data.seniors && Array.isArray(data.seniors)) {
          console.log('데이터가 seniors 구조입니다.');
          // SeniorDailyListDto 구조에서 dailyActivities 추출
          const firstSenior = data.seniors[0];
          if (firstSenior && firstSenior.dailyActivities) {
            activitiesArray = firstSenior.dailyActivities;
          }
        } else if (data && data.seniorDtos && Array.isArray(data.seniorDtos)) {
          console.log('데이터가 seniorDtos 구조입니다.');
          // 기존 seniorDtos 구조에서 dailyActivities 추출
          const firstSenior = data.seniorDtos[0];
          if (firstSenior && firstSenior.dailyActivities) {
            activitiesArray = firstSenior.dailyActivities;
          }
        } else if (data && data.content) {
          console.log('데이터가 content 구조입니다.');
          activitiesArray = data.content;
        } else if (data && data.activities) {
          console.log('데이터가 activities 구조입니다.');
          activitiesArray = data.activities;
        }
        
        console.log('추출된 활동 배열:', activitiesArray);
        console.log('활동 배열 개수:', activitiesArray.length);
        setDailyActivities(activitiesArray);
      } else {
        console.error('일정 데이터 로드 실패:', response.status);
        setDailyActivities([]);
      }
      
    } catch (error) {
      console.error('일정 데이터 로드 오류:', error);
      setError('일정 데이터를 불러오는데 실패했습니다.');
      setDailyActivities([]);
    } finally {
      setActivitiesLoading(false); // 일정 로딩 종료
    }
  };

  // selectedSenior나 selectedDate가 변경될 때 일정 데이터 로드
  useEffect(() => {
    console.log('=== selectedSenior 또는 selectedDate 변경 감지 ===');
    console.log('selectedSenior:', selectedSenior?.seniorName);
    console.log('selectedDate:', selectedDate.toISOString().split('T')[0]);
    
    if (selectedSenior?.id && selectedDate) {
      console.log('일정 데이터 로드:', selectedSenior.seniorName, selectedDate.toISOString().split('T')[0]);
      fetchDailyActivities(selectedSenior.id, selectedDate);
    } else {
      setDailyActivities([]);
    }
    
    // 보호 대상자나 날짜가 변경되면 활동 기록 폼 초기화
    console.log('=== 보호 대상자/날짜 변경으로 인한 폼 초기화 ===');
    
    // 수정 모드 초기화
    setIsEditing(false);
    setEditingActivity(null);
    
    // 드롭다운 선택 초기화
    setSelectedItems(prev => {
      const reset = {};
      Object.keys(prev).forEach(key => {
        reset[key] = '';
      });
      return reset;
    });
    
    // 특이사항 입력 초기화
    setFormData(prev => ({
      ...prev,
      specialNotes: ''
    }));
    
    console.log('폼 초기화 완료');
  }, [selectedSenior, selectedDate]);
  


  // 일정 관리 정보 표시
  const displayedDailyActivities = useMemo(() => {
    const activities = dailyActivities || [];
    const sorted = activitySortColumn === 'activity_category' || activitySortColumn === 'daily_notes'
      ? sortDailyActivites(activities, activitySortColumn, activitySortDirection)
      : [...activities];

    const displayed = [...sorted];

    while (displayed.length < 10) {
      displayed.push({
        id: `empty-${displayed.length}`,
        isEmpty: true,
        senior_id: null,
        activity_date: '',
        activity_category: '',
        daily_notes: '',
        created_at: '',
        updated_at: '',
      });
    }

    return displayed;
  }, [dailyActivities, activitySortColumn, activitySortDirection, sortDailyActivites]);

  // 보호대상자 선택 시 스크롤 위치 유지
  const handleSeniorClick = useCallback((senior) => {
    if (!senior.isEmpty) {
      console.log('선택된 Senior:', senior);
      
      // 상태 업데이트를 즉시 수행
      setSelectedSenior(prevSelected => {
        if (prevSelected?.id === senior.id) {
          return prevSelected; // 동일한 대상자를 다시 선택한 경우 업데이트 안함
        }
        
        return senior;
      });
      
      // 일정 데이터 로드를 즉시 실행 (동기적으로)
      if (selectedDate) {
        fetchDailyActivities(senior.id, selectedDate);
      }
    }
  }, [selectedDate]);

  // 선택된 Senior가 변경된 후 스크롤 위치 복원 (제거 - 불필요해짐)

  // 헤더 클릭 핸들러 - 보호 대상자 테이블
  const handleSeniorHeaderClick = (column) => {
    if (seniorSortColumn === column) {
      setSeniorSortDirection(seniorSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSeniorSortColumn(column);
      setSeniorSortDirection('asc');
    }
  };

  // 헤더 클릭 핸들러 - 일정 관리 테이블
  const handleActivityHeaderClick = (column) => {
    if (activitySortColumn === column) {
      setActivitySortDirection(activitySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setActivitySortColumn(column);
      setActivitySortDirection('asc');
    }
  };

  // 보호 대상자 목록 로드
  const loadSeniors = async (page = 1, size = pageSize) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.log('JWT 토큰이 없습니다.');
        setSeniors([]);
        setSelectedSenior(null);
        setTotalPages(1);
        setTotalElements(0);
        return;
      }

      // 실제 API 호출 (페이지네이션 파라미터 추가)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors?page=${page - 1}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('보호 대상자 목록 로드 성공:', data);
        
        // Spring Boot 페이지네이션 응답 처리
        if (data.content && Array.isArray(data.content)) {
          // 페이지네이션 데이터가 있는 경우
          console.log('백엔드에서 받은 Senior 데이터 샘플:', data.content[0]); // 첫 번째 데이터 로그
          if (data.content[0]) {
            console.log('첫 번째 Senior의 전화번호 필드:', {
              phoneNumber: data.content[0].phoneNumber,
              phone: data.content[0].phone,
              '전체 필드': Object.keys(data.content[0])
            });
          }
          setSeniors(data.content);
          setCurrentPage(data.number + 1); // Spring은 0부터 시작
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          
          console.log('페이지네이션 정보:', {
            currentPage: data.number + 1,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            size: data.size
          });
          
          if (data.content.length > 0) {
            setSelectedSenior(data.content[0]); // 모든 페이지에서 첫 번째 Senior를 자동 선택
          } else {
            setSelectedSenior(null);
          }
        } else if (Array.isArray(data)) {
          // 단순 배열 응답인 경우 (페이지네이션 없음)
          setSeniors(data);
          setTotalPages(1);
          setTotalElements(data.length);
          setCurrentPage(1);
          
          if (data.length > 0) {
            setSelectedSenior(data[0]);
          } else {
            setSelectedSenior(null);
          }
        } else {
          setSeniors([]);
          setSelectedSenior(null);
          setTotalPages(1);
          setTotalElements(0);
        }
      } else {
        console.error('Senior 데이터 로드 실패:', response.status);
        setSeniors([]);
        setSelectedSenior(null);
        setTotalPages(1);
        setTotalElements(0);
        setError('보호 대상자 목록을 불러오는데 실패했습니다.');
      }
      
    } catch (error) {
      console.error('보호 대상자 목록 로드 오류:', error);
      setSeniors([]);
      setSelectedSenior(null);
      setTotalPages(1);
      setTotalElements(0);
      setError('보호 대상자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 드롭다운 데이터 불러오기
  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        console.log('JWT 토큰이 없습니다.');
        // 임시 해결책: 디폴트 데이터 사용
        const defaultItems = ['식사', '운동', '약물복용', '외출', '휴식', '기타'];
        setDropdownItems(defaultItems);
        const initialSelected = {};
        defaultItems.forEach(itemValue => {
          initialSelected[itemValue] = '';
        });
        setSelectedItems(initialSelected);
        console.log('디폴트 드롭다운 아이템 사용:', defaultItems);
        return;
      }

      // 실제 API 호출
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/user-settings/dropdown-items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('드롭다운 데이터 로드 성공:', data);
        
        // 백엔드에서 String 배열로 받아오므로 직접 사용
        // 유효한 문자열만 필터링
        const validItems = data.filter(item => item && typeof item === 'string' && item.trim() !== '');
        setDropdownItems(validItems);
        
        // 초기 선택값 설정
        const initialSelected = {};
        validItems.forEach(itemValue => {
          initialSelected[itemValue] = ''; // 기본값은 비워둔상태
        });
        setSelectedItems(initialSelected);
      } else {
        console.error('API 응답 오류:', response.status, response.statusText);
        setError('드롭다운 데이터를 불러오는데 실패했습니다.');
        setDropdownItems([]);
        setSelectedItems({});
      }
      
    } catch (error) {
      console.error('드롭다운 데이터 불러오기 실패:', error);
      setError('드롭다운 데이터를 불러오는데 실패했습니다.');
      setDropdownItems([]);
      setSelectedItems({});
    } finally {
      setLoading(false);
    }
  };

  // 드롭다운 값 변경 핸들러
  const handleItemChange = (subCategory, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [subCategory]: value
    }));
  };

  // 삭제 핸들러
  const handleDelete = async (activity) => {
    if (!activity || activity.isEmpty) return;
    
    console.log('=== 삭제 함수 시작 ===');
    console.log('삭제할 활동:', activity);
    
    // 삭제 확인
    if (!window.confirm(`정말로 이 활동 기록을 삭제하시겠습니까?\n\n카테고리: ${activity.activityCategory || '비어있음'}\n특이사항: ${activity.dailyNotes || '비어있음'}`)) {
      console.log('삭제 취소');
      return;
    }
    
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.error('토큰이 없습니다!');
        setError('로그인이 필요합니다.');
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
        
        return;
      }
      
      if (!selectedSenior?.id) {
        console.error('선택된 대상자가 없습니다!');
        setError('보호 대상자를 선택해주세요.');
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
        
        return;
      }
      
      const deleteUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${selectedSenior.id}/dailyActivities/${activity.id}`;
      
      console.log('=== 삭제 API 호출 ===');
      console.log('URL:', deleteUrl);
      console.log('Method: DELETE');
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('=== 삭제 API 응답 ===');
      console.log('response status:', response.status);
      console.log('response ok:', response.ok);
      
      if (response.ok) {
        console.log('=== 삭제 성공 ===');
        setSuccess('활동 기록이 삭제되었습니다.');
        
        // 성공 메시지 3초 후 자동 숨김
        setTimeout(() => {
          setSuccess('');
        }, 3000);
        
        // 삭제 후 일정 데이터 새로고침
        if (selectedSenior?.id && selectedDate) {
          console.log('삭제 후 일정 데이터 새로고침');
          fetchDailyActivities(selectedSenior.id, selectedDate);
        }
        
        // 수정 모드였다면 초기화
        if (isEditing && editingActivity?.id === activity.id) {
          setIsEditing(false);
          setEditingActivity(null);
          
          // 입력 필드 초기화
          setSelectedItems(prev => {
            const reset = {};
            Object.keys(prev).forEach(key => {
              reset[key] = '';
            });
            return reset;
          });
          
          setFormData(prev => ({
            ...prev,
            specialNotes: ''
          }));
          
          console.log('삭제 후 수정 모드 초기화 완료');
        }
        
      } else {
        console.error('=== 삭제 실패 ===');
        console.error('status:', response.status);
        
        const errorText = await response.text();
        console.error('error body:', errorText);
        
        setError(`삭제에 실패했습니다. (${response.status})`);
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
      }
      
    } catch (error) {
      console.error('=== 삭제 예외 발생 ===');
      console.error('error:', error);
      setError('삭제에 실패했습니다.');
      
      // 에러 메시지 5초 후 자동 숨김
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked
    });
  };

  // 폼 입력 핸들러
  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // 저장 핸들러 (디버깅 강화)
  const handleSave = async () => {
    console.log('=== 저장 함수 시작 ===');
    console.log('selectedSenior:', selectedSenior);
    console.log('selectedDate:', selectedDate);
    console.log('selectedItems:', selectedItems);
    console.log('formData:', formData);
    
    try {
      setLoading(true);
      const token = getAuthToken();
      
      console.log('=== 토큰 확인 ===');
      console.log('token exists:', !!token);
      console.log('token length:', token ? token.length : 0);
      
      if (!token) {
        console.error('토큰이 없습니다!');
        setError('로그인이 필요합니다.');
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
        
        return;
      }

      if (!selectedSenior?.id) {
        console.error('선택된 대상자가 없습니다!');
        setError('보호 대상자를 선택해주세요.');
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
        
        return;
      }

      console.log('=== 유효성 검사 통과 ===');

      // 선택된 항목 중 실제 값이 있는 것만 저장
      const validSelectedItems = Object.entries(selectedItems)
        .filter(([key, value]) => value && value.trim() !== '')
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      console.log('=== 유효한 선택 항목 ===');
      console.log('validSelectedItems:', validSelectedItems);
      console.log('첫 번째 값:', Object.values(validSelectedItems)[0]);
      console.log('특이사항:', formData.specialNotes);
      
      // 활동 카테고리는 필수, 특이사항은 선택
      const hasCategory = Object.values(validSelectedItems).length > 0 && Object.values(validSelectedItems)[0].trim() !== '';
      const hasNotes = formData.specialNotes && formData.specialNotes.trim() !== '';
      
      console.log('=== 입력 내용 검사 ===');
      console.log('카테고리 있음:', hasCategory);
      console.log('특이사항 있음:', hasNotes);
      
      // 활동 카테고리는 반드시 선택해야 함
      if (!hasCategory) {
        console.error('활동 카테고리가 선택되지 않았습니다!');
        setError('활동 카테고리를 선택해주세요.');
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
        
        return;
      }

      const saveData = {
        activityCategory: Object.values(validSelectedItems)[0] || '',
        dailyNotes: formData.specialNotes || '',
        activityDate: getKoreanDateString(selectedDate), // 문자열로 변환
      };
      
      console.log('=== 최종 저장 데이터 ===');
      console.log('saveData:', saveData);
      console.log('JSON:', JSON.stringify(saveData));

      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${selectedSenior.id}/dailyActivities`;
      
      console.log('=== API 호출 정보 ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });

      let response;
      
      if (isEditing && editingActivity?.id) {
        console.log('=== 수정 모드 ===');
        const editUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${selectedSenior.id}/dailyActivities/${editingActivity.id}`;
        console.log('Edit URL:', editUrl);
        
        response = await fetch(editUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saveData)
        });
      } else {
        console.log('=== 새로 생성 모드 ===');
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saveData)
        });
      }

      console.log('=== API 응답 ===');
      console.log('response status:', response.status);
      console.log('response ok:', response.ok);
      console.log('response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('=== 저장 성공 ===');
        console.log('result:', result);
        setSuccess('활동 기록이 저장되었습니다.');
        
        // 저장 후 입력 필드 초기화
        setSelectedItems(prev => {
          const reset = {};
          Object.keys(prev).forEach(key => {
            reset[key] = ''; // 모든 드롭다운 선택 초기화
          });
          return reset;
        });
        
        setFormData(prev => ({
          ...prev,
          specialNotes: '' // 특이사항 입력 초기화
        }));
        
        console.log('입력 필드 초기화 완료');
        
        // 수정 모드 초기화
        setIsEditing(false);
        setEditingActivity(null);
        
        console.log('수정 모드 초기화 완료');
        
        // 저장 후 일정 데이터 새로고침
        if (selectedSenior?.id && selectedDate) {
          fetchDailyActivities(selectedSenior.id, selectedDate);
        }
      } else {
        console.error('=== 저장 실패 ===');
        console.error('status:', response.status);
        console.error('statusText:', response.statusText);
        
        const errorText = await response.text();
        console.error('error body:', errorText);
        
        setError(`저장에 실패했습니다. (${response.status})`);
        
        // 에러 메시지 5초 후 자동 숨김
        setTimeout(() => {
          setError('');
        }, 5000);
      }
      
    } catch (error) {
      console.error('=== 예외 발생 ===');
      console.error('error:', error);
      console.error('error message:', error.message);
      console.error('error stack:', error.stack);
      setError('저장에 실패했습니다.');
      
      // 에러 메시지 5초 후 자동 숨김
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // 활동 클릭 핸들러 (수정용)
  const handleActivityClick = (activity) => {
    if (activity.isEmpty) return;
    
    console.log('수정할 활동 선택:', activity);
    console.log('현재 드롭다운 항목들:', dropdownItems);
    
    // 수정 모드로 전환
    setIsEditing(true);
    setEditingActivity(activity);
    
    // 드롭다운에 해당 카테고리 설정 (첫 번째 드롭다운에 선택된 카테고리 설정)
    if (dropdownItems && dropdownItems.length > 0) {
      const newSelectedItems = {};
      // 모든 드롭다운 항목을 초기화하고, 첫 번째에만 선택된 카테고리 설정
      dropdownItems.forEach((item, index) => {
        if (index === 0) {
          // 첫 번째 드롭다운에 선택된 카테고리 설정
          newSelectedItems[item] = activity.activityCategory || '';
        } else {
          newSelectedItems[item] = '';
        }
      });
      
      console.log('설정된 드롭다운 값들:', newSelectedItems);
      setSelectedItems(newSelectedItems);
    }
    
    // 특이사항 입력 필드에 내용 설정
    setFormData(prev => ({
      ...prev,
      specialNotes: activity.dailyNotes || ''
    }));
    
    console.log('수정 모드 활성화:', {
      category: activity.activityCategory,
      notes: activity.dailyNotes
    });
  };
  const handleSeniorSelect = (senior) => {
    setSelectedSenior(senior);
    setShowSeniorSelectModal(false);
    console.log('선택된 대상자:', senior);
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (event, page) => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
    loadSeniors(page, pageSize);
  };
  
  // 카테고리 업데이트 핸들러
  const handleCategoryUpdate = () => {
    console.log('카테고리 업데이트됨 - 드롭다운 새로고침');
    fetchDropdownData(); // 드롭다운 데이터 새로고침
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

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#CCE5FF',
      display: 'flex',
      gap: '0px',
      overflow: 'hidden'
    }}>
      {/* 사이드바 */}
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
      }} elevation={0}>
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
                    // 직접 ProfileManagement로 이동 (모달은 ProfileManagement에서 처리)
                    navigate('/profile/management');
                  } else if (item.text === '보호 대상자') {
                    navigate('/seniors');
                  } else if (item.text === '일정 관리') {
                    setActiveMenu(item.text);
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
      </Paper>

      <Paper sx={{
        backgroundColor: '#ffffff',
        flex: 1,
        display: 'flex',
        overflow: 'auto',
        margin: '1vw 1vw 1vw 80px',
        paddingLeft: '160px',
        minHeight: 'calc(100vh - 2vw)',
        boxSizing: 'border-box',
      }} elevation={0}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          gap: '30px'
        }}>
          {/* 페이지 제목 */}
          <Typography sx={{
            fontFamily: 'Pretendard',
            fontWeight: 700,
            fontSize: '28px',
            color: '#1976d2'
          }}>
            일정 관리
          </Typography>

          {/* 상단 영역: 달력 + 활동기록 */}
          <Box sx={{
            display: 'flex',
            gap: '30px',
            height: 'fit-content'
          }}>
            {/* 달력 영역 */}
            <Box sx={{
              flex: '0 0 350px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <Box sx={{
                width: '100%',
                marginBottom: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                '& .react-calendar': {
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  fontFamily: 'Pretendard',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  flexDirection: 'column'
                },
                '& .react-calendar__navigation': {
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px'
                },
                '& .react-calendar__navigation button': {
                  minWidth: '32px',
                  height: '44px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1976d2',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                    color: 'white'
                  },
                  '&:disabled': {
                    color: '#bdbdbd'
                  }
                },
                '& .react-calendar__navigation__label': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  flex: 1,
                  color: '#212121'
                },
                '& .react-calendar__month-view__weekdays': {
                  borderBottom: '1px solid #e0e0e0',
                  paddingBottom: '5px',
                  marginBottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flex: '0 0 auto'
                },
                '& .react-calendar__month-view__weekdays__weekday': {
                  padding: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#757575',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '35px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                },
                '& .react-calendar__month-view__days': {
                  display: 'flex',
                  flexWrap: 'wrap',
                  flex: 1,
                  alignContent: 'stretch',
                  gap: 0,
                  '& > *': {
                    flexBasis: 'calc(100% / 7)',
                    flexGrow: 1,
                    flexShrink: 0
                  }
                },
                '& .react-calendar__tile': {
                  padding: '8px',
                  fontSize: '0.85rem',
                  border: '1px solid #e0e0e0',
                  backgroundColor: 'white',
                  minHeight: 'auto',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  aspectRatio: '1 / 0.8',
                  transition: 'background-color 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                    color: 'white'
                  }
                },
                '& .react-calendar__tile--active': {
                  backgroundColor: '#1976d2 !important',
                  color: 'white !important',
                  fontWeight: 'bold',
                  border: '1px solid #1976d2'
                },
                '& .react-calendar__tile--now': {
                  backgroundColor: '#bbdefb !important',
                  color: 'white !important',
                  fontWeight: 'bold'
                }
              }}>
                <Calendar
                  onChange={(date) => {
                    console.log('달력에서 선택된 날짜:', date);
                    setSelectedDate(date);
                    // 선택된 보호대상자가 있으면 해당 날짜의 일정 데이터 로드
                    if (selectedSenior?.id) {
                      fetchDailyActivities(selectedSenior.id, date);
                    }
                  }}
                  value={selectedDate}
                  locale="ko-KR"
                  formatShortWeekday={(locale, date) => {
                    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                    return weekdays[date.getDay()];
                  }}
                  formatDay={(locale, date) => date.getDate().toString()}
                />
              </Box>
            </Box>

            {/* 활동기록 영역 */}
            <Paper sx={{
              flex: 1,
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '15px',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* 활동 기록 헤더 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#0869CC'
                }}>
                  {selectedSenior ? selectedSenior.seniorName : '대상자 선택'}님 활동 기록
                </Typography>

                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {new Date().toLocaleDateString('ko-KR')}
                </Typography>
              </Box>

              {/* 상단 액션 영역 */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontSize: '14px',
                  color: '#0869CC',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={() => setShowCategoryModal(true)}
                >
                  + 항목 관리
                </Typography>

                <Box sx={{ display: 'flex', gap: '10px' }}>
                  {isEditing && (
                    <>
                      <Button
                        onClick={() => {
                          console.log('=== 취소 버튼 클릭 ===');
                          
                          // 수정 모드 초기화
                          setIsEditing(false);
                          setEditingActivity(null);
                          
                          // 드롭다운 선택 초기화
                          setSelectedItems(prev => {
                            const reset = {};
                            Object.keys(prev).forEach(key => {
                              reset[key] = '';
                            });
                            console.log('취소 - 드롭다운 초기화:', reset);
                            return reset;
                          });
                          
                          // 특이사항 입력 초기화
                          setFormData(prev => {
                            const newFormData = {
                              ...prev,
                              specialNotes: ''
                            };
                            console.log('취소 - 특이사항 초기화:', newFormData.specialNotes);
                            return newFormData;
                          });
                          
                          console.log('취소 버튼 - 모든 폼 초기화 완료');
                        }}
                        sx={{
                          backgroundColor: '#757575',
                          color: 'white',
                          fontFamily: 'Pretendard',
                          fontSize: '14px',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: '#616161'
                          }
                        }}
                      >
                        취소
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (editingActivity) {
                            handleDelete(editingActivity);
                          }
                        }}
                        sx={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          fontFamily: 'Pretendard',
                          fontSize: '14px',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: '#d32f2f'
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={handleSave}
                    sx={{
                      backgroundColor: isEditing ? '#FF9800' : '#00458B',
                      color: 'white',
                      fontFamily: 'Pretendard',
                      fontSize: '14px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: isEditing ? '#F57C00' : '#003366'
                      }
                    }}
                  >
                    {isEditing ? '수정' : '저장'}
                  </Button>
                </Box>
              </Box>

              {/* 드롭다운 - 강제 표시 */}
              <Box sx={{ marginBottom: '20px' }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '16px',
                  marginBottom: '10px'
                }}>
                  활동 카테고리 선택 <span style={{ color: '#f44336' }}>*</span>
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedItems[dropdownItems[0]] || ''}
                    onChange={(e) => handleItemChange(dropdownItems[0], e.target.value)}
                    displayEmpty
                    sx={{
                      fontFamily: 'Pretendard',
                      fontSize: '14px'
                    }}
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {dropdownItems.map((itemValue, index) => (
                      <MenuItem key={index} value={itemValue}>
                        {itemValue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 일일 특이사항 */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '16px',
                  marginBottom: '15px'
                }}>
                  일일 특이사항
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  name="specialNotes"
                  placeholder="특이사항을 입력하세요..."
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'Pretendard',
                      fontSize: '14px'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>

          {/* 하단 영역: 보호 대상자 목록 + 일정 관리 목록 */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '15px'
          }}>
            {/* 보호 대상자 목록 */}
            <Box sx={{
              width: '30%'
            }}>
              <Typography variant="h6" sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '22px',
                color: '#0869CC',
                marginBottom: '15px'
              }}>
                보호 대상자 목록
              </Typography>
              
              {seniors && seniors.length > 0 ? (
                <>
                  <TableContainer 
                    component={Paper} 
                    ref={seniorTableRef}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0',
                      border: '2px solid #1976d2',
                      boxShadow: 'none',
                      height: '224px',
                      overflow: 'auto',
                      maxHeight: '224px',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#1976d2',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        }
                      }
                    }}>
                    <Table stickyHeader>
                      <TableHead sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        '& .MuiTableCell-root': {
                          backgroundColor: 'rgba(51, 153, 255, 1)',
                          borderBottom: '2px solid #1976d2',
                          fontFamily: 'Pretendard',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#000',
                          textAlign: 'center',
                          padding: '6px 4px',
                          height: '24px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backdropFilter: 'none',
                          '&:hover': {
                            backgroundColor: 'rgba(51, 153, 255, 1)'
                          }
                        }
                      }}>
                        <TableRow>
                          <TableCell sx={{ width: '25%', minWidth: '80px', maxWidth: '120px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <TableSortLabel
                                active={seniorSortColumn === 'seniorName'}
                                direction={seniorSortColumn === 'seniorName' ? seniorSortDirection : 'asc'}
                                onClick={() => handleSeniorHeaderClick('seniorName')}
                                sx={{
                                  '& .MuiTableSortLabel-icon': {
                                    display: 'none'
                                  },
                                  '&:hover': {
                                    color: '#1976d2'
                                  }
                                }}
                              >
                                이름
                              </TableSortLabel>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: '20%', minWidth: '60px', maxWidth: '80px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <TableSortLabel
                                active={seniorSortColumn === 'age'}
                                direction={seniorSortColumn === 'age' ? seniorSortDirection : 'asc'}
                                onClick={() => handleSeniorHeaderClick('age')}
                                sx={{
                                  '& .MuiTableSortLabel-icon': {
                                    display: 'none'
                                  },
                                  '&:hover': {
                                    color: '#1976d2'
                                  }
                                }}
                              >
                                나이
                              </TableSortLabel>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: '35%', minWidth: '100px', maxWidth: '140px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <TableSortLabel
                                active={seniorSortColumn === 'phoneNumber'}
                                direction={seniorSortColumn === 'phoneNumber' ? seniorSortDirection : 'asc'}
                                onClick={() => handleSeniorHeaderClick('phoneNumber')}
                                sx={{
                                  '& .MuiTableSortLabel-icon': {
                                    display: 'none'
                                  },
                                  '&:hover': {
                                    color: '#1976d2'
                                  }
                                }}
                              >
                                전화번호
                              </TableSortLabel>
                            </Box>
                          </TableCell>                        
                          <TableCell sx={{ width: '20%', minWidth: '60px', maxWidth: '80px' }}>상태</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{
                        '& .MuiTableRow-root': {
                          transition: 'background-color 0.15s ease',
                          '&:nth-of-type(even)': {
                            backgroundColor: '#f8f9fa'
                          },
                          '&.data-row:hover': {
                            backgroundColor: '#e3f2fd',
                            cursor: 'pointer'
                          },
                          '&.data-row.selected': {
                            backgroundColor: '#bbdefb !important',
                            '&:hover': {
                              backgroundColor: '#90caf9 !important'
                            }
                          },
                          '&:last-child': {
                            '& .MuiTableCell-root': {
                              borderBottom: 'none'
                            }
                          }
                        },
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid #1976d2',
                          fontFamily: 'Pretendard',
                          fontSize: '12px',
                          color: '#333',
                          textAlign: 'center',
                          padding: '6px 4px',
                          height: '28px',
                          transition: 'all 0.15s ease'
                        }
                      }}>
                        {displayedSeniors.map((senior) => (
                          <TableRow 
                            key={senior.id}
                            className={senior.isEmpty ? "" : "data-row"}
                            onClick={() => handleSeniorClick(senior)}
                            sx={{
                              backgroundColor: selectedSenior && selectedSenior.id === senior.id ? '#bbdefb !important' : 'inherit',
                              cursor: senior.isEmpty ? 'default' : 'pointer',
                              transition: 'none',
                              willChange: 'auto',
                              '& .MuiTableCell-root': {
                                userSelect: senior.isEmpty ? 'none' : 'auto',
                                pointerEvents: senior.isEmpty ? 'none' : 'auto'
                              },
                              '&:hover': {
                                backgroundColor: senior.isEmpty ? 'inherit' : (
                                  selectedSenior && selectedSenior.id === senior.id ? '#90caf9 !important' : '#e3f2fd'
                                )
                              }
                            }}
                          >
                            <TableCell sx={{ 
                              width: '25%', 
                              minWidth: '80px', 
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {senior.seniorName}
                            </TableCell>
                            <TableCell sx={{ 
                              width: '20%', 
                              minWidth: '60px', 
                              maxWidth: '80px'
                            }}>
                              {senior.age ? `${senior.age}세` : (senior.isEmpty ? '' : '-')}
                            </TableCell>
                            <TableCell sx={{ 
                              width: '35%', 
                              minWidth: '100px', 
                              maxWidth: '140px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {senior.phoneNumber || (senior.isEmpty ? '' : '-')}
                            </TableCell>
                            <TableCell sx={{
                              width: '20%',
                              minWidth: '60px',
                              maxWidth: '80px',
                              color: selectedSenior && selectedSenior.id === senior.id ? '#1976d2' : '#666',
                              fontWeight: selectedSenior && selectedSenior.id === senior.id ? 'bold' : 'normal'
                            }}>
                              {senior.isEmpty ? '' : (
                                selectedSenior && selectedSenior.id === senior.id ? (
                                  <CheckCircle sx={{ color: '#1976d2', fontSize: '20px' }} />
                                ) : (
                                  <RadioButtonUnchecked sx={{ color: '#ccc', fontSize: '20px' }} />
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 페이지네이션 */}
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
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton 
                      showLastButton
                      disabled={loading}
                    />
                  </Box>
                </>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', border: '2px solid #1976d2' }}>
                  <Typography sx={{
                    fontFamily: 'Pretendard',
                    color: '#666666',
                    fontSize: '16px'
                  }}>
                    등록된 보호 대상자가 없습니다.
                  </Typography>
                </Paper>
              )}
            </Box>

              {/* 일정 관리 목록 */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{
                fontFamily: 'Pretendard',
                fontWeight: 700,
                fontSize: '22px',
                color: '#0869CC',
                marginBottom: '15px'
              }}>
                일정 관리 목록
              </Typography>
              
              {/* 로딩 상태 표시 */}
              {!selectedSenior ? (
                <Box>
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    border: '2px solid #1976d2',
                    boxShadow: 'none',
                    height: '224px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{
                      fontFamily: 'Pretendard',
                      color: '#666666',
                      fontSize: '16px'
                    }}>
                      보호 대상자를 선택해주세요.
                    </Typography>
                  </TableContainer>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '15px',
                    padding: '10px 0',
                    gap: '8px'
                  }}>
                    <Typography sx={{
                      fontFamily: 'Pretendard',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      대상자를 선택해주세요.
                    </Typography>
                    <Pagination 
                      count={1}
                      page={1}
                      onChange={(event, page) => console.log('Activity page changed to:', page)}
                      color="primary"
                      showFirstButton 
                      showLastButton
                      disabled={true}
                    />
                  </Box>
                </Box>
              ) : (
                <>
                  {/* 일정 관리 목록 항상 표시 */}
                  <TableContainer component={Paper} sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0',
                    border: '2px solid #1976d2',
                    boxShadow: 'none',
                    height: '224px',
                    overflow: 'auto',
                    maxHeight: '224px',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#1976d2',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      }
                    }
                  }}>
                <Table stickyHeader>
                  <TableHead sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    '& .MuiTableCell-root': {
                      backgroundColor: 'rgba(51, 153, 255, 1)',
                      borderBottom: '2px solid #1976d2',
                      fontFamily: 'Pretendard',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#000',
                      textAlign: 'center',
                      padding: '6px 4px',
                      height: '24px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      backdropFilter: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(51, 153, 255, 1)'
                      }
                    }
                  }}>
                    <TableRow>
                      <TableCell sx={{ width: '25%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <TableSortLabel
                            active={activitySortColumn === 'activity_category'}
                            direction={activitySortColumn === 'activity_category' ? activitySortDirection : 'asc'}
                            onClick={() => handleActivityHeaderClick('activity_category')}
                            sx={{
                              '& .MuiTableSortLabel-icon': {
                                display: 'none'
                              },
                              '&:hover': {
                                color: '#1976d2'
                              }
                            }}
                          >
                            항목
                          </TableSortLabel>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: '75%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <TableSortLabel
                            active={activitySortColumn === 'daily_notes'}
                            direction={activitySortColumn === 'daily_notes' ? activitySortDirection : 'asc'}
                            onClick={() => handleActivityHeaderClick('daily_notes')}
                            sx={{
                              '& .MuiTableSortLabel-icon': {
                                display: 'none'
                              },
                              '&:hover': {
                                color: '#1976d2'
                              }
                            }}
                          >
                            특이사항
                          </TableSortLabel>
                        </Box>
                      </TableCell>                
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{
                    '& .MuiTableRow-root': {
                      transition: 'background-color 0.15s ease',
                      '&:nth-of-type(even)': {
                        backgroundColor: '#f8f9fa'
                      },
                      '&.data-row:hover': {
                        backgroundColor: '#e3f2fd',
                        cursor: 'pointer'
                      },
                      '&.data-row.selected': {
                        backgroundColor: '#bbdefb !important',
                        '&:hover': {
                          backgroundColor: '#90caf9 !important'
                        }
                      },
                      '&:last-child': {
                        '& .MuiTableCell-root': {
                          borderBottom: 'none'
                        }
                      }
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid #1976d2',
                      fontFamily: 'Pretendard',
                      fontSize: '12px',
                      color: '#333',
                      textAlign: 'center',
                      padding: '6px 4px',
                      height: '28px',
                      transition: 'all 0.15s ease'
                    }
                  }}>
                    {displayedDailyActivities.map((activity) => (
                      <TableRow 
                        key={activity.id}
                        className={activity.isEmpty ? "" : "data-row"}
                        onClick={() => handleActivityClick(activity)} // 행 전체 클릭으로 수정 모드 진입
                        sx={{
                          cursor: activity.isEmpty ? 'default' : 'pointer',
                          '& .MuiTableCell-root': {
                            userSelect: activity.isEmpty ? 'none' : 'auto',
                            pointerEvents: activity.isEmpty ? 'none' : 'auto'
                          },
                          '&:hover': {
                            backgroundColor: activity.isEmpty ? 'inherit' : '#e3f2fd'
                          },
                          backgroundColor: isEditing && editingActivity?.id === activity.id ? '#fff3e0' : 'inherit'
                        }}
                      >
                        {/* 로딩 상태 */}
                        {activitiesLoading && activity.id === 'empty-0' ? (
                          <TableCell colSpan={2} sx={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#1976d2',
                            fontStyle: 'italic'
                          }}>
                            일정 데이터를 불러오는 중...
                          </TableCell>
                        /* 데이터가 없는 경우 */
                        ) : selectedSenior && !activitiesLoading && dailyActivities.length === 0 && activity.id === 'empty-0' ? (
                          <TableCell colSpan={2} sx={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#999',
                            fontStyle: 'italic'
                          }}>
                            {selectedDate.toLocaleDateString('ko-KR')} 일정 데이터가 없습니다.
                          </TableCell>
                        /* 일반 데이터 표시 */
                        ) : (
                          <>
                            <TableCell 
                              sx={{
                                width: '25%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={activity.activityCategory || ''}
                            >
                              {activity.activityCategory || (activity.isEmpty ? '' : '-')}
                            </TableCell>
                            <TableCell 
                              sx={{
                                width: '75%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={activity.dailyNotes || ''}
                            >
                              {activity.dailyNotes || (activity.isEmpty ? '' : '-')}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

                  {/* 페이지네이션 */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '15px',
                    padding: '10px 0',
                    gap: '8px'
                  }}>                    
                    <Pagination 
                      count={1}
                      page={1}
                      onChange={(event, page) => console.log('Activity page changed to:', page)}
                      color="primary"
                      showFirstButton 
                      showLastButton
                      disabled={activitiesLoading}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 대상자 선택 모달 */}
      <SeniorSelectModal
        open={showSeniorSelectModal}
        onClose={() => setShowSeniorSelectModal(false)}
        onSelect={handleSeniorSelect}
        selectedSenior={selectedSenior}
      />
      
      {/* 카테고리 관리 모달 */}
      <CategoryManageModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onUpdate={handleCategoryUpdate}
      />

      {/* 메시지 표시 */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1500
          }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default Daily;
