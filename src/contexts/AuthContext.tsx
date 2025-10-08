import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // Check for saved user session
    const savedUser = localStorage.getItem('pia-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('pia-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // First check mock users
    let mockUser = mockUsers[credentials.id];
    
    // If not in mock users, check AccountManagement accounts
    if (!mockUser) {
      const accountsData = localStorage.getItem('accounts');
      if (accountsData) {
        try {
          const accounts = JSON.parse(accountsData);
          const account = accounts.find((acc: any) => acc.username === credentials.id);
          if (account && account.password === credentials.password) {
            mockUser = {
              password: account.password,
              user: {
                id: account.id,
                name: account.name,
                email: account.username + '@company.com',
                role: account.role,
                company: account.company
              }
            };
          }
        } catch (error) {
          console.error('Failed to parse accounts:', error);
        }
      }
    }
    
    if (mockUser && mockUser.password === credentials.password) {
      setUser(mockUser.user);
      localStorage.setItem('pia-user', JSON.stringify(mockUser.user));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pia-user');
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