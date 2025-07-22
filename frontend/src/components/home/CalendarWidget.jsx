import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import Calendar from 'react-calendar';

const CalendarWidget = ({ 
  selectedDate, 
  onDateChange,
  totalRightBoxHeight 
}) => {
  // 달력 동적 높이 계산 함수 - 실제 달력 DOM에서 날짜 셀 개수 감지
  const adjustCalendarHeight = () => {
    console.log('🔍 달력 DOM 분석 시작...');
    
    const calendarTiles = document.querySelectorAll('.react-calendar__tile');
    
    if (calendarTiles.length === 0) {
      console.log('⚠️ 달력 셀을 찾을 수 없음 - 기본값 사용');
      return { containerHeight: 300, calendarHeight: 270 };
    }
    
    console.log(`📅 찾은 달력 셀 개수: ${calendarTiles.length}개`);
    
    const weeksNeeded = Math.ceil(calendarTiles.length / 7);
    console.log(`📅 계산된 주수: ${weeksNeeded}주`);
    
    let result;
    switch (weeksNeeded) {
      case 4:
        result = { containerHeight: 250, calendarHeight: 220 };
        break;
      case 5:
        result = { containerHeight: 300, calendarHeight: 270 };
        break;
      case 6:
        result = { containerHeight: 380, calendarHeight: 350 };
        break;
      default:
        result = { containerHeight: 300, calendarHeight: 270 };
        break;
    }
    
    return result;
  };

  const [dynamicCalendarHeight, setDynamicCalendarHeight] = useState({ containerHeight: 300, calendarHeight: 270 });
  
  // 현재 선택된 날짜의 달력 높이 계산
  const calendarDimensions = useMemo(() => {
    console.log(`🔄 달력 높이 사용: 컨테이너 ${dynamicCalendarHeight.containerHeight}px, 내부 ${dynamicCalendarHeight.calendarHeight}px`);
    return dynamicCalendarHeight;
  }, [selectedDate, dynamicCalendarHeight]);

  const handleDateChange = (date) => {
    console.log('📅 달력에서 날짜 선택됨:', date);
    
    // DOM 기반 높이 감지 (약간의 지연 후)
    setTimeout(() => {
      const newDimensions = adjustCalendarHeight();
      setDynamicCalendarHeight(newDimensions);
      console.log(`📐 새로운 달력 높이 감지: ${newDimensions.calendarHeight}px`);
    }, 100);
    
    onDateChange(date);
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    console.log('📅 달력 월 변경됨:', activeStartDate);
    
    // 월 변경 시에도 높이 재계산
    setTimeout(() => {
      const newDimensions = adjustCalendarHeight();
      setDynamicCalendarHeight(newDimensions);
      console.log(`📐 월 변경 후 달력 높이: ${newDimensions.calendarHeight}px`);
    }, 200);
  };

  return (
    <Box sx={{
      width: '100%',
      height: `${calendarDimensions.calendarHeight}px`,
      maxHeight: `${calendarDimensions.calendarHeight}px`,
      minHeight: `${calendarDimensions.calendarHeight}px`,  
      border: '1px solid #e0e0e0',
      borderRadius: 1.25,
      padding: 1.5,
      backgroundColor: '#f8f9fa',
      overflow: 'hidden',
      boxSizing: 'border-box',
      transition: 'height 0.3s ease-in-out',
      // 월별 높이 자동 조절
      '& .react-calendar__month-view': {
        height: 'auto'
      },
      '& .react-calendar': {
        width: '100%',
        height: '100%',
        border: 'none',
        fontFamily: theme => theme.typography.fontFamily,
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column'
      },
      '& .react-calendar__navigation': {
        height: '20px',
        display: 'flex',
        alignItems: 'center'
      },
      '& .react-calendar__navigation button': {
        minWidth: '32px',
        height: '44px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: theme => theme.palette.primary.main,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 1,
        cursor: 'pointer',
        transition: theme => theme.transitions.create(['background-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: theme => theme.palette.primary.main,
          color: 'white'
        },
        '&:disabled': {
          color: theme => theme.palette.text.disabled
        }
      },
      '& .react-calendar__navigation__label': {
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        color: theme => theme.palette.text.primary
      },
      '& .react-calendar__month-view__weekdays': {
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
        paddingBottom: 0.625,
        marginBottom: 0.625,
        display: 'flex',
        justifyContent: 'space-between',
        flex: '0 0 auto'
      },
      '& .react-calendar__month-view__weekdays__weekday': {
        padding: 0.5,
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme => theme.palette.text.secondary,
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
        padding: 1,
        fontSize: '0.85rem',
        border: theme => `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: 'white',
        minHeight: 'auto',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        aspectRatio: '1 / 0.8',
        transition: theme => theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: theme => theme.palette.primary.light,
          color: 'white'
        }
      },
      '& .react-calendar__tile--active': {
        backgroundColor: theme => `${theme.palette.primary.main} !important`,
        color: 'white !important',
        fontWeight: 'bold'
      },
      '& .react-calendar__tile--now': {
        backgroundColor: theme => `${theme.palette.primary.light} !important`,
        color: 'white !important',
        fontWeight: 'bold'
      }
    }}>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="ko-KR"
        formatDay={(locale, date) => date.getDate().toString()}
        onActiveStartDateChange={handleActiveStartDateChange}
      />
    </Box>
  );
};

export default CalendarWidget;