// 사용자 설정 관련 API 서비스
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// API Base URL 설정 - Vite 환경변수 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 모든 요청에 Authorization 헤더 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('현재 토큰 상태:', {
      토큰존재: !!token,
      토큰미리보기: token ? token.substring(0, 20) + '...' : 'null'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization 헤더 추가됨:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.warn('토큰이 없어서 Authorization 헤더를 추가하지 않습니다.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 오류 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('인증 오류 발생, 로그인이 필요합니다.');
      // 필요시 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

class UserSettingService {
  
  /**
   * 사용자 설정 저장
   * @param {number} guardianId 
   * @param {string} category 
   * @param {string} subCategory 
   * @param {string} values 
   */
  async saveUserSetting(guardianId, category, subCategory, values) {
    try {
      const response = await apiClient.post('/api/user-settings', {
        guardianId,
        category,
        subCategory,
        values
      });
      return response.data;
    } catch (error) {
      console.error('설정 저장 실패:', error);
      throw new Error(error.response?.data?.message || '설정 저장에 실패했습니다.');
    }
  }

  /**
   * 사용자 설정 조회
   * @param {number} guardianId 
   * @param {string} category 
   * @param {string} subCategory 
   */
  async getUserSettings(guardianId, category = null, subCategory = null) {
    try {
      const params = { guardianId };
      if (category) params.category = category;
      if (subCategory) params.subCategory = subCategory;

      const response = await apiClient.get('/api/user-settings', { params });
      return response.data;
    } catch (error) {
      console.error('설정 조회 실패:', error);
      throw new Error(error.response?.data?.message || '설정 조회에 실패했습니다.');
    }
  }

  /**
   * 바이탈 사인 설정 저장 (개별 레코드 방식)
   * @param {number} guardianId 
   * @param {object} monitoringSettings 
   */
  async saveVitalSignSettings(guardianId, monitoringSettings) {
    try {
      const savePromises = [];

      // 혈압 설정 - 개별 레코드로 저장
      savePromises.push(
        this.saveUserSetting(guardianId, '설정', 'bloodPressureAttentionMax', monitoringSettings.bloodPressure.attentionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodPressureAttentionMin', monitoringSettings.bloodPressure.attentionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodPressureCautionMax', monitoringSettings.bloodPressure.cautionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodPressureCautionMin', monitoringSettings.bloodPressure.cautionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'diastolicAttentionMax', monitoringSettings.bloodPressure.diastolicAttentionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'diastolicAttentionMin', monitoringSettings.bloodPressure.diastolicAttentionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'diastolicCautionMax', monitoringSettings.bloodPressure.diastolicCautionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'diastolicCautionMin', monitoringSettings.bloodPressure.diastolicCautionMin.toString())
      );

      // 심박수 설정
      savePromises.push(
        this.saveUserSetting(guardianId, '설정', 'heartRateAttentionMax', monitoringSettings.heartRate.attentionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'heartRateAttentionMin', monitoringSettings.heartRate.attentionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'heartRateCautionMax', monitoringSettings.heartRate.cautionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'heartRateCautionMin', monitoringSettings.heartRate.cautionMin.toString())
      );

      // 체온 설정
      savePromises.push(
        this.saveUserSetting(guardianId, '설정', 'bodyTemperatureAttentionMax', monitoringSettings.bodyTemperature.attentionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bodyTemperatureAttentionMin', monitoringSettings.bodyTemperature.attentionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'bodyTemperatureCautionMax', monitoringSettings.bodyTemperature.cautionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bodyTemperatureCautionMin', monitoringSettings.bodyTemperature.cautionMin.toString())
      );

      // 혈당 설정
      savePromises.push(
        this.saveUserSetting(guardianId, '설정', 'bloodSugarAttentionMax', monitoringSettings.bloodSugar.attentionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodSugarAttentionMin', monitoringSettings.bloodSugar.attentionMin.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodSugarCautionMax', monitoringSettings.bloodSugar.cautionMax.toString()),
        this.saveUserSetting(guardianId, '설정', 'bloodSugarCautionMin', monitoringSettings.bloodSugar.cautionMin.toString())
      );

      // 알림 설정 (개별 레코드로 저장)
      savePromises.push(
        this.saveUserSetting(guardianId, '설정', 'attentionRatioThreshold', monitoringSettings.alertSettings.attentionRatioThreshold.toString()),
        this.saveUserSetting(guardianId, '설정', 'cautionRatioThreshold', monitoringSettings.alertSettings.cautionRatioThreshold.toString()),
        this.saveUserSetting(guardianId, '설정', 'attentionCountThreshold', monitoringSettings.alertSettings.attentionCountThreshold.toString()),
        this.saveUserSetting(guardianId, '설정', 'cautionCountThreshold', monitoringSettings.alertSettings.cautionCountThreshold.toString()),
        this.saveUserSetting(guardianId, '설정', 'emergencyCountThreshold', monitoringSettings.alertSettings.emergencyCountThreshold.toString())
      );

      // 모든 설정 동시 저장
      const results = await Promise.all(savePromises);
      return { success: true, data: results };
    } catch (error) {
      console.error('바이탈 사인 설정 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 바이탈 사인 설정 조회 (개별 레코드 방식)
   * @param {number} guardianId 
   */
  async getVitalSignSettings(guardianId) {
    try {
      const response = await this.getUserSettings(guardianId, '설정');
      
      if (!response.success || !response.data || response.data.length === 0) {
        // 기본값 반환
        return this.getDefaultVitalSignSettings();
      }

      // 데이터를 monitoringSettings 형태로 변환
      const settingsMap = {};
      response.data.forEach(setting => {
        settingsMap[setting.subCategory] = parseFloat(setting.values) || setting.values;
      });
      
      // 각 카테고리별로 설정 조합
      const settings = {
        bloodPressure: {
          attentionMax: settingsMap.bloodPressureAttentionMax || 180,
          attentionMin: settingsMap.bloodPressureAttentionMin || 90,
          cautionMax: settingsMap.bloodPressureCautionMax || 140,
          cautionMin: settingsMap.bloodPressureCautionMin || 100,
          diastolicAttentionMax: settingsMap.diastolicAttentionMax || 110,
          diastolicAttentionMin: settingsMap.diastolicAttentionMin || 60,
          diastolicCautionMax: settingsMap.diastolicCautionMax || 90,
          diastolicCautionMin: settingsMap.diastolicCautionMin || 65
        },
        heartRate: {
          attentionMax: settingsMap.heartRateAttentionMax || 100,
          attentionMin: settingsMap.heartRateAttentionMin || 50,
          cautionMax: settingsMap.heartRateCautionMax || 90,
          cautionMin: settingsMap.heartRateCautionMin || 60
        },
        bodyTemperature: {
          attentionMax: settingsMap.bodyTemperatureAttentionMax || 38.0,
          attentionMin: settingsMap.bodyTemperatureAttentionMin || 35.5,
          cautionMax: settingsMap.bodyTemperatureCautionMax || 37.5,
          cautionMin: settingsMap.bodyTemperatureCautionMin || 36.0
        },
        bloodSugar: {
          attentionMax: settingsMap.bloodSugarAttentionMax || 250,
          attentionMin: settingsMap.bloodSugarAttentionMin || 70,
          cautionMax: settingsMap.bloodSugarCautionMax || 180,
          cautionMin: settingsMap.bloodSugarCautionMin || 80
        },
        alertSettings: {
          attentionRatioThreshold: settingsMap.attentionRatioThreshold || 10,
          cautionRatioThreshold: settingsMap.cautionRatioThreshold || 30,
          attentionCountThreshold: settingsMap.attentionCountThreshold || 3,
          cautionCountThreshold: settingsMap.cautionCountThreshold || 5,
          emergencyCountThreshold: settingsMap.emergencyCountThreshold || 1,
          useRatioThreshold: true,
          useCountThreshold: true,
          useEmergencyAlert: true
        }
      };

      return settings;
      
    } catch (error) {
      console.error('바이탈 사인 설정 조회 실패:', error);
      // 에러 시 기본값 반환
      return this.getDefaultVitalSignSettings();
    }
  }

  /**
   * 기본 바이탈 사인 설정값
   */
  getDefaultVitalSignSettings() {
    return {
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
      alertSettings: {
        attentionRatioThreshold: 10,
        cautionRatioThreshold: 30,
        attentionCountThreshold: 3,
        cautionCountThreshold: 5,
        emergencyCountThreshold: 1,
        useRatioThreshold: true,
        useCountThreshold: true,
        useEmergencyAlert: true
      }
    };
  }
}

export default new UserSettingService();
