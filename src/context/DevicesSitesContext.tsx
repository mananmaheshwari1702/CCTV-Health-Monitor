import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { devices as initialDevices, sites as initialSites } from '../data/mockData';
import type { Device, Site } from '../types';
import { useAuth } from '../hooks/useAuth';

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

const DevicesSitesContext = createContext<DevicesSitesContextType | undefined>(undefined);

export function DevicesSitesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // Raw State
    const [rawDevices, setRawDevices] = useState<Device[]>(initialDevices);
    const [rawSites, setRawSites] = useState<Site[]>(initialSites);

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

    const value = useMemo<DevicesSitesContextType>(() => ({
        devices, sites, addDevice, updateDevice, deleteDevice, addSite, updateSite, deleteSite,
    }), [devices, sites, addDevice, updateDevice, deleteDevice, addSite, updateSite, deleteSite]);

    return (
        <DevicesSitesContext.Provider value={value}>
            {children}
        </DevicesSitesContext.Provider>
    );
}

export function useDevicesSites() {
    const context = useContext(DevicesSitesContext);
    if (context === undefined) {
        throw new Error('useDevicesSites must be used within a DevicesSitesProvider');
    }
    return context;
}
