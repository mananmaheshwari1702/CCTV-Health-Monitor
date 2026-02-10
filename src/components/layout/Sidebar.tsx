import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    MapPin,
    HardDrive,
    Ticket,
    FileText,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Camera,
    Shield,
    X,
    LogOut,
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/sites', label: 'Sites', icon: MapPin, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/devices', label: 'Devices', icon: HardDrive, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/alerts', label: 'Alerts', icon: Shield, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'manager', 'technician', 'viewer'] },
    { path: '/users', label: 'Users & Roles', icon: Users, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'technician', 'viewer'] },
];

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = allNavItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen bg-slate-900 transition-all duration-300
                ${collapsed ? 'w-20' : 'w-64'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0`}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-bold text-white whitespace-nowrap">
                                CCTV Monitor
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-300">Health Dashboard</p>
                        </div>
                    )}
                </div>
                {/* Mobile close button */}
                {mobileOpen && (
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* System Status */}
            {!collapsed && (
                <div className="px-4 py-4 border-t border-slate-800">
                    <div className="p-3 bg-slate-800 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-slate-200">
                                System Status
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-400">All systems operational</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            )}

            {/* Collapse Toggle - hidden on mobile */}
            <button
                onClick={onToggle}
                className="hidden lg:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 bg-slate-700 border border-slate-600 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
                {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>
        </aside>
    );
}
