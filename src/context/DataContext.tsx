import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import {
    tickets as initialTickets,
    alerts as initialAlerts,
    users as initialUsers,
    devices as initialDevices,
    sites as initialSites,
} from '../data/mockData';
import type { Ticket, Alert, User, Device, Site, DashboardStats, TicketComment, AlertStatus, TicketStatus, AppSettings, DashboardLayoutConfig } from '../types';
import { useAuth } from '../hooks/useAuth';

// ── Domain-specific context types ────────────────────────────────────────

interface TicketsContextType {
    tickets: Ticket[];
    addTicket: (ticket: Ticket) => void;
    updateTicket: (id: string, updates: Partial<Ticket>) => void;
    deleteTicket: (id: string) => void;
    addTicketComment: (ticketId: string, comment: TicketComment) => void;
}

interface AlertsContextType {
    alerts: Alert[];
    addAlert: (alert: Alert) => void;
    updateAlertStatus: (id: string, status: AlertStatus) => void;
    deleteAlert: (id: string) => void;
}

interface DevicesSitesContextType {
    devices: Device[];
    sites: Site[];
    addDevice: (device: Device) => void;
    updateDevice: (id: string, updates: Partial<Device>) => void;
    deleteDevice: (id: string) => void;
    addSite: (site: Site) => void;
    updateSite: (id: string, updates: Partial<Site>) => void;
    deleteSite: (id: string) => void;
}

interface UsersContextType {
    users: User[];
    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    deleteUser: (id: string) => void;
}

interface SettingsContextType {
    settings: AppSettings;
    dashboardStats: DashboardStats;
    dashboardConfig: DashboardLayoutConfig;
    updateSettings: (updates: Partial<AppSettings>) => void;
    updateDashboardConfig: (updates: Partial<DashboardLayoutConfig>) => void;
}

// ── Create contexts ──────────────────────────────────────────────────────

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);
const AlertsContext = createContext<AlertsContextType | undefined>(undefined);
const DevicesSitesContext = createContext<DevicesSitesContextType | undefined>(undefined);
const UsersContext = createContext<UsersContextType | undefined>(undefined);
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ── DataProvider (single component, nested providers) ────────────────────

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

    // Calculate dynamic stats
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

    // ── Stable action callbacks ──────────────────────────────────────────

    // Ticket Actions
    const addTicket = useCallback((ticket: Ticket) => {
        setRawTickets(prev => [ticket, ...prev]);
    }, []);

    const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
        setRawTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    }, []);

    const deleteTicket = useCallback((id: string) => {
        setRawTickets(prev => prev.filter(t => t.id !== id));
    }, []);

    const addTicketComment = useCallback((ticketId: string, comment: TicketComment) => {
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
    }, []);

    // Alert Actions
    const addAlert = useCallback((alert: Alert) => {
        setRawAlerts(prev => [alert, ...prev]);
    }, []);

    const updateAlertStatus = useCallback((id: string, status: AlertStatus) => {
        setRawAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }, []);

    const deleteAlert = useCallback((id: string) => {
        setRawAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    // User Actions
    const addUser = useCallback((newUser: User) => {
        setUsers(prev => [...prev, newUser]);
    }, []);

    const updateUser = useCallback((id: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    }, []);

    const deleteUser = useCallback((id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
    }, []);

    // Device Actions
    const updateDevice = useCallback((id: string, updates: Partial<Device>) => {
        setRawDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }, []);

    const addDevice = useCallback((device: Device) => {
        setRawDevices(prev => [...prev, device]);
    }, []);

    const deleteDevice = useCallback((id: string) => {
        setRawDevices(prev => prev.filter(d => d.id !== id));
    }, []);

    // Site Actions
    const addSite = useCallback((site: Site) => {
        setRawSites(prev => [...prev, site]);
    }, []);

    const updateSite = useCallback((id: string, updates: Partial<Site>) => {
        setRawSites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }, []);

    const deleteSite = useCallback((id: string) => {
        setRawSites(prev => prev.filter(s => s.id !== id));
    }, []);

    // Settings Actions — deep-merges all nested sections to avoid dropping sibling keys
    const updateSettings = useCallback((updates: Partial<AppSettings>) => {
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
            },
            security: {
                ...prev.security,
                ...(updates.security || {})
            }
        }));
    }, []);

    const updateDashboardConfig = useCallback((updates: Partial<DashboardLayoutConfig>) => {
        setDashboardConfig(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem('dashboardConfig', JSON.stringify(next));
            return next;
        });
    }, []);

    // ── Memoized context values (one per domain) ─────────────────────────

    const ticketsValue = useMemo<TicketsContextType>(() => ({
        tickets, addTicket, updateTicket, deleteTicket, addTicketComment,
    }), [tickets, addTicket, updateTicket, deleteTicket, addTicketComment]);

    const alertsValue = useMemo<AlertsContextType>(() => ({
        alerts, addAlert, updateAlertStatus, deleteAlert,
    }), [alerts, addAlert, updateAlertStatus, deleteAlert]);

    const devicesSitesValue = useMemo<DevicesSitesContextType>(() => ({
        devices, sites, addDevice, updateDevice, deleteDevice, addSite, updateSite, deleteSite,
    }), [devices, sites, addDevice, updateDevice, deleteDevice, addSite, updateSite, deleteSite]);

    const usersValue = useMemo<UsersContextType>(() => ({
        users, addUser, updateUser, deleteUser,
    }), [users, addUser, updateUser, deleteUser]);

    const settingsValue = useMemo<SettingsContextType>(() => ({
        settings, dashboardStats, dashboardConfig, updateSettings, updateDashboardConfig,
    }), [settings, dashboardStats, dashboardConfig, updateSettings, updateDashboardConfig]);

    // ── Nested providers ─────────────────────────────────────────────────

    return (
        <TicketsContext.Provider value={ticketsValue}>
            <AlertsContext.Provider value={alertsValue}>
                <DevicesSitesContext.Provider value={devicesSitesValue}>
                    <UsersContext.Provider value={usersValue}>
                        <SettingsContext.Provider value={settingsValue}>
                            {children}
                        </SettingsContext.Provider>
                    </UsersContext.Provider>
                </DevicesSitesContext.Provider>
            </AlertsContext.Provider>
        </TicketsContext.Provider>
    );
}

// ── Domain-specific hooks ────────────────────────────────────────────────

export function useTickets() {
    const context = useContext(TicketsContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a DataProvider');
    }
    return context;
}

export function useAlerts() {
    const context = useContext(AlertsContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within a DataProvider');
    }
    return context;
}

export function useDevicesSites() {
    const context = useContext(DevicesSitesContext);
    if (context === undefined) {
        throw new Error('useDevicesSites must be used within a DataProvider');
    }
    return context;
}

export function useUsers() {
    const context = useContext(UsersContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a DataProvider');
    }
    return context;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a DataProvider');
    }
    return context;
}

// ── Backward-compatible façade ───────────────────────────────────────────
// Composes all 5 domain hooks into a single object matching the old API.
// Consumers should migrate to domain-specific hooks for optimal performance.

export function useData() {
    return {
        ...useTickets(),
        ...useAlerts(),
        ...useDevicesSites(),
        ...useUsers(),
        ...useSettings(),
    };
}
