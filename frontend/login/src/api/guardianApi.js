import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const guardianApi = {
  // 보호자 생성
  createGuardian: (guardianData) => 
    api.post('/guardians', guardianData),
  
  // 모든 보호자 조회
  getAllGuardians: () => 
    api.get('/guardians'),
  
  // 보호자 존재 여부 확인
  checkExists: (loginId) => 
    api.get(`/guardians/exists/${loginId}`),
  
  // 특정 보호자 조회
  getGuardian: (loginId) => 
    api.get(`/guardians/${loginId}`),
};