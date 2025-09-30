import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for development
const mockUsers = {
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
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const login = async (credentials) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[credentials.id];
    
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
