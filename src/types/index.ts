// Site Types
export interface Site {
    id: string;
    name: string;
    address: string;
    city: string;
    status: 'active' | 'inactive' | 'maintenance';
    deviceCount: number;
    onlineDevices: number;
    lastSync: string;
}

// Device Types
export interface Device {
    id: string;
    name: string;
    siteId: string;
    siteName: string;
    type: 'camera' | 'nvr' | 'dvr' | 'switch';
    status: 'online' | 'offline' | 'warning';
    health: 'healthy' | 'faulty' | 'degraded';
    recordingStatus: 'recording' | 'not_recording' | 'scheduled';
    lastSeen: string;
    ipAddress: string;
    model: string;
    firmware: string;
}

// Camera Types
export interface DeviceCamera {
    id: string;
    name: string;
    deviceId: string;
    status: 'online' | 'offline' | 'warning';
    type: 'fixed' | 'ptz' | 'dome' | 'bullet';
    resolution: string;
    channel: number;
}

// Recording Calendar Types
export type RecordingStatus = 'available' | 'missing' | 'no_data';

export interface RecordingDay {
    date: string;
    cameraId: string;
    cameraName: string;
    status: RecordingStatus;
}

// Health Timeline Types
export interface HealthTimelineEvent {
    id: string;
    deviceId: string;
    timestamp: string;
    type: 'status_change' | 'alert' | 'maintenance' | 'firmware' | 'restart';
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

// Device Stats
export interface DeviceStats {
    deviceId: string;
    uptimePercent: number;
    hddFreePercent: number;
    cpuUsage: number;
    memoryUsage: number;
    temperature: number;
}

// Ticket Types
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

export interface Ticket {
    id: string;
    title: string;
    description: string;
    deviceId: string;
    deviceName: string;
    siteName: string;
    priority: TicketPriority;
    status: TicketStatus;
    assignee: string;
    createdAt: string;
    updatedAt: string;
}

// User Types
export type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    status: 'active' | 'inactive';
    lastLogin: string;
    sites: string[];
}

// Dashboard Stats
export interface DashboardStats {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    healthyDevices: number;
    faultyDevices: number;
    recordingMissing: number;
    openTickets: number;
    criticalTickets: number;
}

// Alert Types
export interface Alert {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    deviceId: string;
    deviceName: string;
    siteName: string;
    timestamp: string;
}

// Report Types
export interface Report {
    id: string;
    name: string;
    type: 'health' | 'uptime' | 'recording' | 'tickets' | 'custom';
    description: string;
    lastGenerated: string;
    schedule: 'daily' | 'weekly' | 'monthly' | 'on_demand';
}
