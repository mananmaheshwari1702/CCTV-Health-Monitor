import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    tickets as initialTickets,
    alerts as initialAlerts,
    users as initialUsers,
    devices as initialDevices,
    sites as initialSites,
    dashboardStats as initialStats
} from '../data/mockData';
import type { Ticket, Alert, User, Device, Site, DashboardStats, TicketComment, AlertStatus, TicketStatus, AppSettings } from '../types';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [devices, setDevices] = useState<Device[]>(initialDevices);
    const [sites, setSites] = useState<Site[]>(initialSites);

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
        }
    });

    // Calculate dynamic stats based on current state
    const dashboardStats: DashboardStats = {
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        offlineDevices: devices.filter(d => d.status === 'offline').length,
        healthyDevices: devices.filter(d => d.health === 'healthy').length,
        faultyDevices: devices.filter(d => d.health === 'faulty').length,
        recordingMissing: devices.filter(d => d.recordingStatus === 'not_recording' || d.status === 'warning').length,
        openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
        criticalTickets: tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length,
    };

    // Ticket Actions
    const addTicket = (ticket: Ticket) => {
        setTickets(prev => [ticket, ...prev]);
    };

    const updateTicket = (id: string, updates: Partial<Ticket>) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    };

    const deleteTicket = (id: string) => {
        setTickets(prev => prev.filter(t => t.id !== id));
    };

    const addTicketComment = (ticketId: string, comment: TicketComment) => {
        setTickets(prev => prev.map(t => {
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
        setAlerts(prev => [alert, ...prev]);
    };

    const updateAlertStatus = (id: string, status: AlertStatus) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const deleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
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
        setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const addDevice = (device: Device) => {
        setDevices(prev => [...prev, device]);
    };

    const deleteDevice = (id: string) => {
        setDevices(prev => prev.filter(d => d.id !== id));
    };

    // Site Actions
    const addSite = (site: Site) => {
        setSites(prev => [...prev, site]);
    };

    const updateSite = (id: string, updates: Partial<Site>) => {
        setSites(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSite = (id: string) => {
        setSites(prev => prev.filter(s => s.id !== id));
    };

    // Settings Actions
    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
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
            updateSettings
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
