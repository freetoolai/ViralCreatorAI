'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'client';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_USERS = {
    admin: {
        email: 'admin@viralcreatorai.com',
        password: 'demo123',
        user: { id: '1', name: 'Admin User', email: 'admin@viralcreatorai.com', role: 'admin' as const }
    },
    client: {
        email: 'client@example.com',
        password: 'demo123',
        user: { id: '2', name: 'Client User', email: 'client@example.com', role: 'client' as const }
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('viral_auth_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Demo authentication
        const demoUser = Object.values(DEMO_USERS).find(
            u => u.email === email && u.password === password
        );

        if (demoUser) {
            setUser(demoUser.user);
            localStorage.setItem('viral_auth_user', JSON.stringify(demoUser.user));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('viral_auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
