import axios from 'axios';

// API 베이스 URL - 환경변수로 설정 (추후 실제 백엔드 URL로 변경)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      sessionStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 함수들
export const api = {
  // 인증 관련
  auth: {
    login: async (credentials: { id: string; password: string }) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    logout: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
    getCurrentUser: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  },

  // 계정 관리
  accounts: {
    getAll: async () => {
      const response = await apiClient.get('/accounts');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/accounts/${id}`);
      return response.data;
    },
    create: async (account: any) => {
      const response = await apiClient.post('/accounts', account);
      return response.data;
    },
    update: async (id: string, account: any) => {
      const response = await apiClient.put(`/accounts/${id}`, account);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/accounts/${id}`);
      return response.data;
    },
  },

  // 회사 관리
  companies: {
    getAll: async () => {
      const response = await apiClient.get('/companies');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiClient.get(`/companies/${id}`);
      return response.data;
    },
    create: async (company: any) => {
      const response = await apiClient.post('/companies', company);
      return response.data;
    },
    update: async (id: string, company: any) => {
      const response = await apiClient.put(`/companies/${id}`, company);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiClient.delete(`/companies/${id}`);
      return response.data;
    },
  },

  // 처리업무 관리
  tasks: {
    getAll: async (companyId?: string) => {
      const response = await apiClient.get('/tasks', {
        params: { companyId },
      });
      return response.data;
    },
    create: async (task: any) => {
      const response = await apiClient.post('/tasks', task);
      return response.data;
    },
    update: async (id: number, task: any) => {
      const response = await apiClient.put(`/tasks/${id}`, task);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    },
    bulkUpdate: async (tasks: any[]) => {
      const response = await apiClient.put('/tasks/bulk', tasks);
      return response.data;
    },
  },

  // 평가 관리
  evaluations: {
    getAll: async () => {
      const response = await apiClient.get('/evaluations');
      return response.data;
    },
    getById: async (id: number) => {
      const response = await apiClient.get(`/evaluations/${id}`);
      return response.data;
    },
    create: async (evaluation: any) => {
      const response = await apiClient.post('/evaluations', evaluation);
      return response.data;
    },
    update: async (id: number, evaluation: any) => {
      const response = await apiClient.put(`/evaluations/${id}`, evaluation);
      return response.data;
    },
    delete: async (id: number) => {
      const response = await apiClient.delete(`/evaluations/${id}`);
      return response.data;
    },
  },

  // 평가 요청 관리
  evaluationRequests: {
    getAll: async () => {
      const response = await apiClient.get('/evaluation-requests');
      return response.data;
    },
    create: async (request: any) => {
      const response = await apiClient.post('/evaluation-requests', request);
      return response.data;
    },
  },

  // 흐름도 이미지 관리
  flowCharts: {
    get: async (taskName: string) => {
      const response = await apiClient.get(`/flowcharts/${encodeURIComponent(taskName)}`);
      return response.data;
    },
    save: async (taskName: string, imageData: string) => {
      const response = await apiClient.post('/flowcharts', {
        taskName,
        imageData,
      });
      return response.data;
    },
    getAll: async () => {
      const response = await apiClient.get('/flowcharts');
      return response.data;
    },
  },

  // 파일 업로드 (AWS S3)
  files: {
    upload: async (file: File, folder?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }
      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    delete: async (fileUrl: string) => {
      const response = await apiClient.delete('/files', {
        data: { fileUrl },
      });
      return response.data;
    },
  },
};
