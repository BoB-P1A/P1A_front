import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { mockBackend } from '@/lib/mockBackend';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'developer' | 'privacy-team' | 'planning-team';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  companyId?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface LoginCredentials {
  username: string; // 입력받는 아이디
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        try {
          const userData = await api.auth.getCurrentUser();
          setUser({
            id: userData.id,
            username: userData.username,
            name: userData.name,
            role: userData.role as UserRole,
            company: userData.company,
          });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('auth-token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      // ✅ 백엔드가 기대하는 loginId 로 보내도록 변환
      const response = await api.auth.login({
        loginId: credentials.username,
        password: credentials.password,
      });

      localStorage.setItem('auth-token', response.token);

      setUser({
        id: response.user.id,
        username: response.user.username,
        name: response.user.name,
        role: response.user.role as UserRole,
        company: response.user.company,
      });

      toast({ title: '로그인 성공' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);

      // Mock fallback (프론트 개발 편의를 위해 유지)
      try {
        const response = await mockBackend.login(credentials);
        localStorage.setItem('auth-token', response.token);
        setUser(response.user);
        toast({ title: '로그인 성공 (Mock)' });
        setIsLoading(false);
        return true;
      } catch {
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
      localStorage.removeItem('auth-token');
      toast({ title: '로그아웃 되었습니다' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}