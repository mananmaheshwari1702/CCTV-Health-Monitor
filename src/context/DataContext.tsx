import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import {
    tickets as initialTickets,
    alerts as initialAlerts,
    users as initialUsers,
    devices as initialDevices,
    sites as initialSites,
    // dashboardStats as initialStats // Removed as we calculate dynamically
} from '../data/mockData';
import type { Ticket, Alert, User, Device, Site, DashboardStats, TicketComment, AlertStatus, TicketStatus, AppSettings, DashboardLayoutConfig } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DataContextType {
    tickets: Ticket[];
    alerts: Alert[];
    users: User[];
    devices: Device[];
    sites: Site[];
    dashboardStats: DashboardStats;
    settings: AppSettings;

    // Actions
    addTicket: (ticket: Ticket) => void;
    updateTicket: (id: string, updates: Partial<Ticket>) => void;
    deleteTicket: (id: string) => void;
    addTicketComment: (ticketId: string, comment: TicketComment) => void;

    addAlert: (alert: Alert) => void;
    updateAlertStatus: (id: string, status: AlertStatus) => void;
    deleteAlert: (id: string) => void;

    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    deleteUser: (id: string) => void;

    updateDevice: (id: string, updates: Partial<Device>) => void;
    addDevice: (device: Device) => void;
    deleteDevice: (id: string) => void;

    // Site Actions
    addSite: (site: Site) => void;
    updateSite: (id: string, updates: Partial<Site>) => void;
    deleteSite: (id: string) => void;

    updateSettings: (updates: Partial<AppSettings>) => void;

    dashboardConfig: DashboardLayoutConfig;
    updateDashboardConfig: (updates: Partial<DashboardLayoutConfig>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Raw State (The Source of Truth)
    const [rawTickets, setRawTickets] = useState<Ticket[]>(initialTickets);
    const [rawAlerts, setRawAlerts] = useState<Alert[]>(initialAlerts);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [rawDevices, setRawDevices] = useState<Device[]>(initialDevices);
    const [rawSites, setRawSites] = useState<Site[]>(initialSites);

    const [settings, setSettings] = useState<AppSettings>({
        organizationName: 'ACME Corporation',
        systemEmail: 'admin@acme.com',
        timezone: 'EST',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            deviceOffline: true,
            securityAlerts: true,
            storageWarnings: true,
            dailyReports: false,
            mobilePush: false,
        },
        system: {
            healthCheckInterval: 5,
            sessionTimeout: 30,
            maxRecordingGap: 15,
            alertThreshold: 85,
        },
        security: {
            requires2FA: false,
            passwordPolicy: 'basic',
        }
    });

    const [dashboardConfig, setDashboardConfig] = useState<DashboardLayoutConfig>(() => {
        const saved = localStorage.getItem('dashboardConfig');
        return saved ? JSON.parse(saved) : {
            showStatsRow: true,
            showTicketStats: true,
            showRecentAlerts: true,
            showLatestTickets: true,
            showQuickActions: true
        };
    });

    // --- Access Control Logic ---
    // Calculate visible data based on user role and assigned sites

    // 1. Visible Sites
    const sites = useMemo(() => {
        if (!user) return [];
        if (user.role === 'admin') return rawSites;
        return rawSites.filter(site => user.sites.includes(site.id));
    }, [user, rawSites]);

    // 2. Visible Devices (only those in visible sites)
    const devices = useMemo(() => {
        if (!user) return [];
        if (user.role === 'admin') return rawDevices;
        const visibleSiteIds = sites.map(s => s.id);
        return rawDevices.filter(device => visibleSiteIds.includes(device.siteId));
    }, [user, rawDevices, sites]);

    // 3. Visible Tickets (linked to visible devices)
    const tickets = useMemo(() => {
        if (!user) return [];
        if (user.role === 'admin') return rawTickets;
        const visibleDeviceIds = devices.map(d => d.id);
        return rawTickets.filter(ticket => visibleDeviceIds.includes(ticket.deviceId));
    }, [user, rawTickets, devices]);

    // 4. Visible Alerts (linked to visible devices)
    const alerts = useMemo(() => {
        if (!user) return [];
        if (user.role === 'admin') return rawAlerts;
        const visibleDeviceIds = devices.map(d => d.id);
        return rawAlerts.filter(alert => visibleDeviceIds.includes(alert.deviceId));
    }, [user, rawAlerts, devices]);


    // Calculate dynamic stats based on *Filtered* visible data
    const dashboardStats = useMemo<DashboardStats>(() => ({
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        offlineDevices: devices.filter(d => d.status === 'offline').length,
        healthyDevices: devices.filter(d => d.health === 'healthy').length,
        faultyDevices: devices.filter(d => d.health === 'faulty').length,
        recordingMissing: devices.filter(d => d.recordingStatus === 'not_recording' || d.status === 'warning').length,
        openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
        criticalTickets: tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length,
        resolutionRate: (() => {
            if (tickets.length === 0) return 0;
            const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
            return Math.round((resolvedCount / tickets.length) * 100);
        })(),
        avgResponseTime: (() => {
            const respondedTickets = tickets.filter(t => t.comments && t.comments.length > 0);
            if (respondedTickets.length === 0) return 0;

            const totalResponseTime = respondedTickets.reduce((acc, ticket) => {
                const firstResponse = ticket.comments![0].createdAt;
                const created = ticket.createdAt;
                return acc + (new Date(firstResponse).getTime() - new Date(created).getTime());
            }, 0);

            const avgMs = totalResponseTime / respondedTickets.length;
            return Number((avgMs / (1000 * 60 * 60)).toFixed(1));
        })(),
    }), [devices, tickets]);

    // Helper to add IDs to updates for consistency with original pattern if strictly needed,
    // but here we just update state arrays.

    // Ticket Actions
    const addTicket = (ticket: Ticket) => {
        setRawTickets(prev => [ticket, ...prev]);
    };

    const updateTicket = (id: string, updates: Partial<Ticket>) => {
        setRawTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    };

    const deleteTicket = (id: string) => {
        setRawTickets(prev => prev.filter(t => t.id !== id));
    };

    const addTicketComment = (ticketId: string, comment: TicketComment) => {
        setRawTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                return {
                    ...t,
                    comments: [...(t.comments || []), comment],
                    updatedAt: new Date().toISOString()
                };
            }
            return t;
        }));
    };

    // Alert Actions
    const addAlert = (alert: Alert) => {
        setRawAlerts(prev => [alert, ...prev]);
    };

    const updateAlertStatus = (id: string, status: AlertStatus) => {
        setRawAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const deleteAlert = (id: string) => {
        setRawAlerts(prev => prev.filter(a => a.id !== id));
    };

    // User Actions
    const addUser = (user: User) => {
        setUsers(prev => [...prev, user]);
    };

    const updateUser = (id: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const deleteUser = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    // Device Actions
    const updateDevice = (id: string, updates: Partial<Device>) => {
        setRawDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const addDevice = (device: Device) => {
        setRawDevices(prev => [...prev, device]);
    };

    const deleteDevice = (id: string) => {
        setRawDevices(prev => prev.filter(d => d.id !== id));
    };

    // Site Actions
    const addSite = (site: Site) => {
        setRawSites(prev => [...prev, site]);
    };

    const updateSite = (id: string, updates: Partial<Site>) => {
        setRawSites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSite = (id: string) => {
        setRawSites(prev => prev.filter(s => s.id !== id));
    };

    // Settings Actions
    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...updates,
            notifications: {
                ...prev.notifications,
                ...(updates.notifications || {})
            },
            system: {
                ...prev.system,
                ...(updates.system || {})
            }
        }));
    };

    const updateDashboardConfig = (updates: Partial<DashboardLayoutConfig>) => {
        setDashboardConfig(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem('dashboardConfig', JSON.stringify(next));
            return next;
        });
    };

    return (
        <DataContext.Provider value={{
            tickets,
            alerts,
            users,
            devices,
            sites,
            dashboardStats,
            settings,
            dashboardConfig,
            addTicket,
            updateTicket,
            deleteTicket,
            addTicketComment,
            addAlert,
            updateAlertStatus,
            deleteAlert,
            addUser,
            updateUser,
            deleteUser,
            updateDevice,
            addDevice,
            deleteDevice,
            addSite,
            updateSite,
            deleteSite,
            updateSettings,
            updateDashboardConfig
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
