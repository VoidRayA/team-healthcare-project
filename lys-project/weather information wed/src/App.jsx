import React, { useState } from 'react';

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  const apiKey = 'b5ef2fafd84a4e53801270cb490f4c51';

  const fetchWeather = () => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`)
      .then(response => response.json())
      .then(data => {
        if (data.cod === 200) setWeather(data);
        else {
          alert('도시를 찾을 수 없습니다.');
          setWeather(null);
        }
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>날씨 웹</h1>
      <input
        value={city}
        onChange={e => setCity(e.target.value)}
        placeholder="도시명 입력"
      />
      <button onClick={fetchWeather}>검색</button>

      {weather && (
        <div>
          <h2>{weather.name} 날씨</h2>
          <p>온도: {weather.main.temp}°C</p>
          <p>날씨: {weather.weather[0].description}</p>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="날씨 아이콘"
          />
        </div>
      )}
    </div>
  );
}
















// 3. 앱 기본 UI 설계
// 입력창 (도시명 입력)
// 검색 버튼
// 날씨 결과 표시 영역 (온도, 상태, 아이콘 등)








// 4. 날씨 API 연동하기
// API 요청 URL 예:
// bash
// https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=YOUR_API_KEY&units=metric
// JavaScript fetch 함수로 데이터 받아오기








// 5. 코드 예시 (React)
// jsx
// import React, { useState } from 'react';

// function WeatherApp() {
//   const [city, setCity] = useState('');
//   const [weather, setWeather] = useState(null);

//   const apiKey = 'YOUR_API_KEY';

//   const fetchWeather = () => {
//     fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.cod === 200) setWeather(data);
//         else {
//           alert('도시를 찾을 수 없습니다.');
//           setWeather(null);
//         }
//       });
//   };

//   return (
//     <div>
//       <input value={city} onChange={e => setCity(e.target.value)} placeholder="도시명 입력" />
//       <button onClick={fetchWeather}>검색</button>

//       {weather && (
//         <div>
//           <h2>{weather.name} 날씨</h2>
//           <p>온도: {weather.main.temp}°C</p>
//           <p>날씨: {weather.weather[0].description}</p>
//           <img
//             src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//             alt="weather icon"
//           />
//           <p>습도: {weather.main.humidity}%</p>
//           <p>풍속: {weather.wind.speed} m/s</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default WeatherApp;













// 6. 추가 기능 아이디어
// 현재 위치 기반 날씨 조회 (Geolocation API 활용)

// 여러 도시 저장 및 즐겨찾기

// 5일간 날씨 예보 추가

// 스타일링 강화 (Material-UI, Tailwind CSS 등)

// 모바일 반응형 디자인









// 7. 배포하기
// GitHub Pages, Netlify, Vercel 같은 무료 호스팅으로 배포 가능

// 필요하면 순수 HTML/JS 버전, 더 자세한 설명, 디자인 도움도 드릴 수 있어요! 어떤 부분이 가장 궁금하세요? 