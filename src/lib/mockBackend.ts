/**
 * Mock Backend - 개발/테스트용
 * 
 * 실제 백엔드가 구축되기 전까지 사용할 목 데이터와 함수들
 * 백엔드 API가 준비되면 src/lib/api.ts의 API 호출이 자동으로 사용됩니다.
 */

import { User } from '@/contexts/AuthContext';

// 목 사용자 데이터
export const mockUsers: Record<string, { password: string; user: User }> = {
  'admin': {
    password: 'admin123',
    user: {
      id: 'admin',
      name: '관리자',
      email: 'admin@pia.com',
      role: 'admin',
      company: 'PIA Corp',
    }
  },
  'developer': {
    password: 'dev123',
    user: {
      id: 'developer',
      name: '김개발',
      email: 'dev@pia.com',
      role: 'developer',
      company: 'PIA Corp',
    }
  },
  'privacy': {
    password: 'privacy123',
    user: {
      id: 'privacy',
      name: '박개인정보',
      email: 'privacy@pia.com',
      role: 'privacy-team',
      company: 'PIA Corp',
    }
  },
};

/**
 * 목 백엔드 - 실제 백엔드 없이 테스트하기 위한 함수
 * API가 실패하면 이 함수들이 fallback으로 사용됩니다.
 */
export const mockBackend = {
  // 로그인
  login: async (credentials: { id: string; password: string }) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // API 지연 시뮬레이션
    
    const mockUser = mockUsers[credentials.id];
    if (mockUser && mockUser.password === credentials.password) {
      return {
        token: 'mock-jwt-token-' + credentials.id,
        user: mockUser.user,
      };
    }
    throw new Error('Invalid credentials');
  },

  // 현재 사용자 정보
  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // sessionStorage에서 토큰 확인
    const token = sessionStorage.getItem('auth-token');
    if (token) {
      const userId = token.replace('mock-jwt-token-', '');
      const mockUser = mockUsers[userId];
      if (mockUser) {
        return mockUser.user;
      }
    }
    throw new Error('Not authenticated');
  },
};
