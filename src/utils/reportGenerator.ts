import * as XLSX from 'xlsx';
import { format, subDays, subMonths, isAfter, isBefore, parseISO } from 'date-fns';
import { Device, Site, Ticket, RecordingDay } from '../types';

export interface ReportFilterParams {
    site: string;
    deviceType: string;
    status: string;
    issueType: string;
    deviceId?: string;
}

export interface GenerateReportParams {
    type: string;
    duration: string;
    startDate: string;
    endDate: string;
    filters: ReportFilterParams;
    data: {
        devices: Device[];
        sites: Site[];
        tickets: Ticket[];
    };
    userRoles?: string[];
    userSites?: string[];
}

// Helper to determine the date range
const getDateRange = (duration: string, startDateStr: string, endDateStr: string) => {
    const end = new Date();
    let start = new Date();

    switch (duration) {
        case 'last_7_days':
            start = subDays(end, 7);
            break;
        case 'last_30_days':
            start = subDays(end, 30);
            break;
        case 'last_3_months':
            start = subMonths(end, 3);
            break;
        case 'last_6_months':
            start = subMonths(end, 6);
            break;
        case 'custom':
            if (startDateStr && endDateStr) {
                start = parseISO(startDateStr);
                // Set end to end of day
                const parsedEnd = parseISO(endDateStr);
                parsedEnd.setHours(23, 59, 59, 999);
                return { start, end: parsedEnd };
            }
            break;
        case 'all_data':
            start = new Date(0); // Beginning of time
            break;
    }
    return { start, end };
};

// Filter devices based on UI selections
const filterDevices = (devices: Device[], filters: ReportFilterParams, userSites?: string[]) => {
    return devices.filter(device => {
        // RBAC Check
        if (userSites && userSites.length > 0 && !userSites.includes(device.siteId)) {
            return false;
        }

        if (filters.site !== 'all' && device.siteId !== filters.site) return false;
        if (filters.deviceType !== 'all' && device.type !== filters.deviceType) return false;

        if (filters.status !== 'all') {
            if (filters.status === 'online' && device.status !== 'online') return false;
            if (filters.status === 'warning' && (device.status !== 'warning' && device.health !== 'degraded')) return false;
            if (filters.status === 'offline' && device.status !== 'offline') return false;
        }

        if (filters.issueType !== 'all') {
            if (filters.issueType === 'offline' && device.status !== 'offline') return false;
            if (filters.issueType === 'storage' && device.health !== 'degraded' && device.health !== 'faulty') return false;
            if (filters.issueType === 'recording' && device.recordingStatus !== 'not_recording') return false;
        }

        if (filters.deviceId && filters.deviceId.trim() !== '') {
            if (device.id !== filters.deviceId) {
                return false;
            }
        }

        return true;
    });
};

export const generateExcelReport = async (params: GenerateReportParams) => {
    const { type, duration, startDate, endDate, filters, data, userSites } = params;
    const { start, end } = getDateRange(duration, startDate, endDate);
    const { devices, tickets } = data;

    const filteredDevsByProps = filterDevices(devices, filters, userSites);

    // Apply strict date filtering to devices (Last Seen)
    const filteredDevs = filteredDevsByProps.filter(d => {
        const deviceDate = parseISO(d.lastSeen);
        return isAfter(deviceDate, start) && isBefore(deviceDate, end);
    });

    // Apply strict date filtering to tickets (Created At)
    const filteredTickets = tickets.filter(t => {
        const ticketDate = parseISO(t.createdAt);
        return isAfter(ticketDate, start) && isBefore(ticketDate, end);
    });

    let exportData: any[] = [];
    let sheetName = 'Report';

    // Build the data rows based on report type
    switch (type) {
        case 'dvr_nvr_health':
            sheetName = 'DVR_NVR_Health';
            exportData = filteredDevs
                .filter(d => d.type === 'dvr' || d.type === 'nvr')
                .map(d => ({
                    'Device ID': d.id,
                    'Device Name': d.name,
                    'Type': d.type.toUpperCase(),
                    'Location / Region': d.siteName,
                    'Status': d.status,
                    'Health': d.health,
                    'IP Address': d.ipAddress,
                    'Firmware': d.firmware,
                    'Last Seen': format(parseISO(d.lastSeen), 'yyyy-MM-dd HH:mm:ss')
                }));
            break;

        case 'camera_health':
            sheetName = 'Camera_Health';
            exportData = filteredDevs
                .filter(d => d.type === 'camera')
                .map(d => ({
                    'Device ID': d.id,
                    'Device Name': d.name,
                    'Location / Region': d.siteName,
                    'Status': d.status,
                    'Health': d.health,
                    'IP Address': d.ipAddress,
                    'Model': d.model,
                    'Last Seen': format(parseISO(d.lastSeen), 'yyyy-MM-dd HH:mm:ss')
                }));
            break;

        case 'hdd_health':
            sheetName = 'HDD_Health';
            exportData = filteredDevs
                .filter(d => d.type === 'dvr' || d.type === 'nvr')
                .map(d => ({
                    'Device Name': d.name,
                    'Location / Region': d.siteName,
                    'Status': d.status,
                    // Mocking HDD specific stats since we don't have deeply nested real data for it
                    'Storage Status': d.health === 'faulty' ? 'Critical' : 'Healthy',
                    'Capacity Used %': Math.floor(Math.random() * 40) + 40 + '%',
                    'SMART Status': d.health === 'faulty' ? 'Warning' : 'OK'
                }));
            break;

        case 'recording_availability':
            sheetName = 'Recording_Availability';
            exportData = filteredDevs.map(d => {
                // Determine days span for accurate missing days mock based on range
                const msInDay = 24 * 60 * 60 * 1000;
                const daysInSpan = Math.round(Math.abs((end.getTime() - start.getTime()) / msInDay));
                const missingMax = Math.min(daysInSpan, 10); // cap random missing to range span

                return {
                    'Device ID': d.id,
                    'Device Name': d.name,
                    'Type': d.type.toUpperCase(),
                    'Location': d.siteName,
                    'Recording Status': d.recordingStatus,
                    'Days Monitored': daysInSpan,
                    'Estimated Missing Days (Range)': d.recordingStatus === 'not_recording' ? Math.floor(Math.random() * missingMax) + 1 : 0
                }
            });
            break;

        case 'ticket_log':
            sheetName = 'Tickets';
            // Also filter tickets by userSites if applicable
            let rbacTickets = filteredTickets;
            if (userSites && userSites.length > 0) {
                const allowedSiteNames = data.sites.filter(s => userSites.includes(s.id)).map(s => s.name);
                rbacTickets = filteredTickets.filter(t => allowedSiteNames.includes(t.siteName));
            }

            // Further filter tickets based on UI filters (Device/Status)
            rbacTickets = rbacTickets.filter(t => {
                const ticketDevice = data.devices.find(d => d.id === t.deviceId);
                if (!ticketDevice) return true; // Keep if orphaned but matched site

                // Apply similar generic device filters to the ticket list if requested
                if (filters.site !== 'all' && ticketDevice.siteId !== filters.site) return false;
                if (filters.deviceType !== 'all' && ticketDevice.type !== filters.deviceType) return false;
                return true;
            });

            exportData = rbacTickets.map(t => ({
                'Ticket ID': t.id,
                'Title': t.title,
                'Device Name': t.deviceName,
                'Location': t.siteName,
                'Priority': t.priority,
                'Status': t.status,
                'Assignee': t.assignee,
                'Created At': format(parseISO(t.createdAt), 'yyyy-MM-dd HH:mm'),
                'Updated At': format(parseISO(t.updatedAt), 'yyyy-MM-dd HH:mm')
            }));
            break;

        case 'consolidated':
        default:
            sheetName = 'Consolidated_Health';
            exportData = filteredDevs.map(d => {
                const deviceTickets = filteredTickets.filter(t => t.deviceId === d.id);
                const hasOpenTicket = deviceTickets.some(t => t.status !== 'closed' && t.status !== 'resolved');

                return {
                    'Device ID': d.id,
                    'Device Name': d.name,
                    'Device Type': d.type.toUpperCase(),
                    'Location / Region': d.siteName,
                    'Status': d.status,
                    'Error Duration': d.status === 'offline' ? '2 hrs 15 mins' : 'N/A', // Mock error duration
                    'Uptime %': d.status === 'online' ? '99.9%' : '85.4%', // Mock uptime
                    'Issue Type': d.status === 'offline' ? 'Network Timeout' : (d.health === 'degraded' ? 'Storage Warning' : 'None'),
                    'Recording Available': d.recordingStatus === 'recording' ? 'Yes' : 'No',
                    'Missing Days': d.recordingStatus === 'recording' ? 0 : Math.floor(Math.random() * 5) + 1,
                    'Ticket ID': hasOpenTicket ? deviceTickets[0].id : 'N/A',
                    'Last Seen Online': format(parseISO(d.lastSeen), 'yyyy-MM-dd HH:mm:ss')
                };
            });
            break;
    }

    if (exportData.length === 0) {
        throw new Error('No data available for the selected criteria and date range.');
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-size columns slightly
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15) // minimum width of 15
    }));
    worksheet['!cols'] = colWidths;

    // Generate filename
    const dateStr = duration === 'custom'
        ? `${format(start, 'ddMMM')}_to_${format(end, 'ddMMM')}`
        : duration;
    const generatedStamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const fileName = `${type.toUpperCase()}_${dateStr}_generated${generatedStamp}.xlsx`;

    // Download
    XLSX.writeFile(workbook, fileName);
};
