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
            className={`fixed top-0 right-0 left-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 
                ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}
        >
            <div className="flex items-center justify-between h-full px-6">
                {/* Left: Mobile menu + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{currentTitle}</h1>
                        <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
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
                                className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900 dark:text-gray-200">Camera offline</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Lobby Cam 2 went offline 2h ago</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900 dark:text-gray-200">Recording gap detected</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">DVR at Airport Terminal B</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                        <p className="text-sm font-medium text-slate-900 dark:text-gray-200">Low storage warning</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">NVR storage at 85%</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
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
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                {currentUser.avatar}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {currentUser.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50">
                                <a
                                    href="#"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </a>
                                <a
                                    href="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </a>
                                <hr className="my-2 border-slate-100 dark:border-slate-800" />
                                <a
                                    href="/login"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
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
