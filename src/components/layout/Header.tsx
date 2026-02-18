import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Bell,
    Search,
    ChevronDown,
    User,
    LogOut,
    Settings,
    Menu,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationsContext';
import { ConfirmModal } from '../ui/Modal';

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
    '/notifications': 'Notifications',
    '/alerts': 'Alerts',
    '/profile': 'Profile',
};

export function Header({ onMobileMenuToggle, sidebarCollapsed }: HeaderProps) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { unreadCount, notifications, markAllAsRead } = useNotifications();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
                                className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <>
                                {/* Backdrop to close on outside click */}
                                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />

                                {/* Popover — fixed on mobile, absolute on sm+ */}
                                <div className="fixed inset-x-3 top-14 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-[28rem] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto overscroll-contain">
                                        {notifications.filter(n => !n.read).length === 0 ? (
                                            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                <p className="text-sm">No new notifications</p>
                                            </div>
                                        ) : (
                                            notifications.filter(n => !n.read).map((notification) => (
                                                <div key={notification.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-gray-200">{notification.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                                        <Link
                                            to="/notifications"
                                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 block text-center"
                                            onClick={() => setNotificationsOpen(false)}
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-semibold rounded-full overflow-hidden">
                                {user?.avatar && user.avatar.length > 4 ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm">
                                        {user?.avatar || (user?.name || '')
                                            .split(' ')
                                            .map(n => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </span>
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <hr className="my-2 border-slate-100 dark:border-slate-800" />
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        setIsLogoutModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={logout}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                cancelText="Cancel"
            />
        </header>
    );
}
