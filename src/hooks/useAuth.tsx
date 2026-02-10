import { useState, createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { users } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
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

    const hasPermission = (requiredRole: UserRole | UserRole[]) => {
        if (!user) return false;

        const roles: UserRole[] = ['admin', 'manager', 'technician', 'viewer'];
        const userRoleIndex = roles.indexOf(user.role);

        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role);
        }

        // Simple hierarchy: admin > manager > technician > viewer
        // But for this app, we might want strict equality or simplified "canEdit" logic
        // For now, let's just check if the role matches or is 'admin' (super user)
        if (user.role === 'admin') return true;

        return user.role === requiredRole;
    };

    // Improved Permission Logic Helper
    const canManageUsers = user?.role === 'admin';
    const canManageTickets = ['admin', 'manager', 'technician'].includes(user?.role || '');
    const canViewOnly = user?.role === 'viewer';

    return (
        <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
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
