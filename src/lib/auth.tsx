'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

// Auth context for client-side state
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('viral_auth_user');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });

    const login = async (email: string, password: string): Promise<boolean> => {
        // This is a legacy method. Please use NextAuth instead.
        console.warn('Legacy login method called with:', email, password);
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
