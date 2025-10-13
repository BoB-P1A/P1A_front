import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { mockBackend } from '@/lib/mockBackend';
import { toast } from '@/hooks/use-toast';
import { User as ApiUser } from '@/types/api';

export type UserRole = 'admin' | 'developer' | 'privacy-team' | 'planning-team';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface LoginCredentials {
  id: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin': {
    password: 'admin123',
    user: {
      id: 'admin',
      name: '관리자',
      email: 'admin@pia.com',
      role: 'admin',
      company: 'PIA Corp'
    }
  },
  'developer': {
    password: 'dev123',
    user: {
      id: 'developer',
      name: '김개발',
      email: 'dev@pia.com',
      role: 'developer',
      company: 'PIA Corp'
    }
  },
  'privacy': {
    password: 'privacy123',
    user: {
      id: 'privacy',
      name: '박개인정보',
      email: 'privacy@pia.com',
      role: 'privacy-team',
      company: 'PIA Corp'
    }
  },
  'planning': {
    password: 'plan123',
    user: {
      id: 'planning',
      name: '김기획',
      email: 'planning@pia.com',
      role: 'planning-team',
      company: 'PIA Corp'
    }
  },
  'plan': {
    password: 'plan123',
    user: {
      id: 'plan',
      name: '최기획',
      email: 'plan@pia.com',
      role: 'planning-team',
      company: 'PIA Corp'
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth token and fetch current user
    const checkAuth = async () => {
      const token = sessionStorage.getItem('auth-token');
      if (token) {
        try {
          const userData = await api.auth.getCurrentUser();
          // API User를 Context User로 변환
          const contextUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: mapApiRoleToContextRole(userData.role),
            company: userData.company,
          };
          setUser(contextUser);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // API 실패 시 mock 데이터 사용
          try {
            const mockUser = await mockBackend.getCurrentUser();
            setUser(mockUser);
          } catch (mockError) {
            sessionStorage.removeItem('auth-token');
          }
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // API UserRole을 Context UserRole로 매핑
  const mapApiRoleToContextRole = (apiRole: string): UserRole => {
    switch (apiRole) {
      case 'super_admin':
      case 'company_admin':
        return 'admin';
      default:
        return apiRole as UserRole;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // API 호출로 로그인
      const response = await api.auth.login(credentials);
      
      // 토큰 저장
      sessionStorage.setItem('auth-token', response.token);
      
      // API User를 Context User로 변환
      const contextUser: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: mapApiRoleToContextRole(response.user.role),
        company: response.user.company,
      };
      setUser(contextUser);
      
      toast({ title: '로그인 성공' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      // API 실패 시 mock 백엔드 시도
      try {
        const response = await mockBackend.login(credentials);
        sessionStorage.setItem('auth-token', response.token);
        setUser(response.user);
        toast({ title: '로그인 성공 (Mock)' });
        setIsLoading(false);
        return true;
      } catch (mockError) {
        toast({ title: '로그인 실패', description: '아이디와 비밀번호를 확인해주세요.', variant: 'destructive' });
        setIsLoading(false);
        return false;
      }
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('auth-token');
      toast({ title: '로그아웃 되었습니다' });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}