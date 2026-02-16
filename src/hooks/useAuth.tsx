import { useState, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { users } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Default to admin for development convenience, or null to force login
    const [user, setUser] = useState<User | null>(users[0]);

    const login = (role: UserRole) => {
        // Mock login: find first user with that role
        const mockUser = users.find(u => u.role === role);
        if (mockUser) {
            setUser(mockUser);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const hasPermission = (requiredRole: UserRole | UserRole[]) => {
        if (!user) return false;

        // Admin always has permission
        if (user.role === 'admin') return true;

        // Normalize to array and check if user's role is included
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        return roles.includes(user.role);
    };

    // Improved Permission Logic Helper
    const canManageUsers = user?.role === 'admin';
    const canManageTickets = ['admin', 'manager', 'technician'].includes(user?.role || '');
    const canViewOnly = user?.role === 'viewer';

    return (
        <AuthContext.Provider value={{ user, login, logout, hasPermission, updateUser }}>
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
