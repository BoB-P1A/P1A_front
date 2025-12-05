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
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

interface LoginCredentials {
    username: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            try {
                const userData = await api.auth.getCurrentUser();
                setUser({
                    id: userData.id,
                    username: userData.username,
                    name: userData.name,
                    role: userData.role as UserRole,
                    companyId: userData.companyId,
                    company: userData.company,
                });
            } catch (error) {
                console.error('Failed to refresh user:', error);
                localStorage.removeItem('auth-token');
                setUser(null);
            }
        }
    };

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
                        companyId: userData.companyId,
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
            console.log('API 로그인 시도');
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
                companyId: response.user.companyId,
                company: response.user.company,
            });

            console.log('API 로그인 성공');
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('API Login failed:', error);
            setIsLoading(false);
            console.log('false 반환');
            return false;
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
        <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
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