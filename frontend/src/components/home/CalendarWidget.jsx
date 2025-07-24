import { Box } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarWidget = ({ selectedDate, onDateChange }) => {
  const handleDateChange = (date) => {
    onDateChange(date);
  };

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 1.25,
        padding: 1.5,
        backgroundColor: '#f8f9fa',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease-in-out',

        '& .react-calendar': {
          width: '100%',
          border: 'none',
          fontFamily: theme => theme.typography.fontFamily,
          backgroundColor: 'transparent',
        },

        '& .react-calendar__navigation': {
          marginBottom: '8px', // 네비게이션과 요일 사이 간격
          height: 'auto',
        },

        '& .react-calendar__navigation button': {
          minWidth: '32px',
          height: '30px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme => theme.palette.primary.main,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme => theme.palette.primary.main,
            color: 'white',
          },
        },

        '& .react-calendar__month-view__weekdays': {
          marginBottom: '4px', // 요일과 날짜 사이 간격
        },

        '& .react-calendar__month-view__weekdays__weekday': {
          padding: '4px 0', // 요일 항목의 패딩
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: theme => theme.palette.text.secondary,
          textTransform: 'uppercase',
        },

        '& .react-calendar__tile': {
          padding: 1,
          fontSize: '0.85rem',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1 / 0.8',
          border: theme => `1px solid ${theme.palette.grey[200]}`,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme => theme.palette.primary.light,
            color: 'white',
          },
        },

        '& .react-calendar__tile--active': {
          backgroundColor: theme => `${theme.palette.primary.main} !important`,
          color: 'white !important',
          fontWeight: 'bold',
        },
      }}
    >
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="ko-KR"
        formatDay={(locale, date) => date.getDate().toString()}
      />
    </Box>
  );
};

export default CalendarWidget;