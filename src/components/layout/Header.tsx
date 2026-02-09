import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Bell,
    Search,
    ChevronDown,
    User,
    LogOut,
    Settings,
    Menu,
} from 'lucide-react';
import { currentUser } from '../../data/mockData';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    sidebarCollapsed: boolean;
}

const pageTitle: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/sites': 'Sites & Devices',
    '/tickets': 'Tickets',
    '/reports': 'Reports',
    '/users': 'Users & Roles',
    '/settings': 'Settings',
};

export function Header({ onMobileMenuToggle, sidebarCollapsed }: HeaderProps) {
    const location = useLocation();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const currentTitle = Object.entries(pageTitle).find(([path]) =>
        location.pathname.startsWith(path)
    )?.[1] || 'Dashboard';

    return (
        <header
            className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'
                }`}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left: Mobile menu + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{currentTitle}</h1>
                        <p className="text-sm text-slate-500">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Right: Search + Notifications + User */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="hidden md:flex items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search devices, sites..."
                                className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900">Camera offline</p>
                                        <p className="text-xs text-slate-500">Lobby Cam 2 went offline 2h ago</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900">Recording gap detected</p>
                                        <p className="text-xs text-slate-500">DVR at Airport Terminal B</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900">Low storage warning</p>
                                        <p className="text-xs text-slate-500">NVR storage at 85%</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 border-t border-slate-100">
                                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                                        View all notifications
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                {currentUser.avatar}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900">
                                    {currentUser.name}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                <a
                                    href="#"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </a>
                                <a
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </a>
                                <hr className="my-2 border-slate-100" />
                                <a
                                    href="/login"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
