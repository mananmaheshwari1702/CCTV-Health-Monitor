import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Camera,
    Wifi,
    WifiOff,
    MapPin,
    Clock,
    Settings,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Video,
    HardDrive,
    Cpu,
    Activity,
    Thermometer,
    Info,
    Wrench,
    RotateCcw,
    Download,
    ChevronLeft,
    ChevronRight,
    Tag,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Badge,
    StatusBadge,
    HealthBadge,
    Modal,
    Input,
    Select,
} from '../components/ui';
import { useTickets, useDevicesSites } from '../context/DataContext';
import { deviceCameras, deviceStatsData, healthTimelineEvents, generateRecordingCalendar } from '../data/mockData';
import type { RecordingDay, HealthTimelineEvent as TimelineEvent } from '../types';


// ─── Helpers ──────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateTime(dateStr: string): string {
    return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

// ─── Timeline Icon ────────────────────────────────────────────────────
function TimelineIcon({ event }: { event: TimelineEvent }) {
    const baseClass = 'w-4 h-4';
    switch (event.type) {
        case 'status_change':
            return event.severity === 'error'
                ? <XCircle className={`${baseClass} text-red-500`} />
                : <CheckCircle className={`${baseClass} text-emerald-500`} />;
        case 'alert':
            return <AlertTriangle className={`${baseClass} text-amber-500`} />;
        case 'maintenance':
            return <Wrench className={`${baseClass} text-blue-500`} />;
        case 'firmware':
            return <Download className={`${baseClass} text-purple-500`} />;
        case 'restart':
            return <RotateCcw className={`${baseClass} text-orange-500`} />;
        default:
            return <Info className={`${baseClass} text-slate-500`} />;
    }
}

const severityBorder: Record<string, string> = {
    success: 'border-emerald-500',
    info: 'border-blue-500',
    warning: 'border-amber-500',
    error: 'border-red-500',
};

// ─── Memoized Calendar Sub-components ─────────────────────────────────
interface RecordingCellProps {
    camId: string;
    camName: string;
    date: string;
    status: string;
    entry: RecordingDay | undefined;
    onSelect: (entry: RecordingDay) => void;
}

const RecordingCell = React.memo(function RecordingCell({
    camId, camName, date, status, entry, onSelect,
}: RecordingCellProps) {
    const cellColor =
        status === 'available'
            ? 'bg-emerald-500 hover:bg-emerald-600'
            : status === 'missing'
                ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600';

    return (
        <button
            className={`h-5 rounded-sm ${cellColor} transition-colors`}
            onClick={
                status === 'missing' && entry
                    ? () => onSelect(entry)
                    : undefined
            }
            title={`${camName} — ${formatDate(date)} — ${status.replace('_', ' ')}`}
        />
    );
});

interface CameraRowProps {
    camId: string;
    camName: string;
    dateRange: string[];
    recordingDataMap: Map<string, RecordingDay>;
    onSelect: (entry: RecordingDay) => void;
}

const CameraRow = React.memo(function CameraRow({
    camId, camName, dateRange, recordingDataMap, onSelect,
}: CameraRowProps) {
    return (
        <div className="flex items-center mt-1">
            <div className="w-32 flex-shrink-0 pr-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={camName}>
                    {camName}
                </p>
            </div>
            <div className="flex-1 grid gap-px" style={{ gridTemplateColumns: `repeat(${dateRange.length}, 1fr)` }}>
                {dateRange.map((date) => {
                    const entry = recordingDataMap.get(`${camId}-${date}`);
                    const status = entry?.status ?? 'no_data';
                    return (
                        <RecordingCell
                            key={`${camId}-${date}`}
                            camId={camId}
                            camName={camName}
                            date={date}
                            status={status}
                            entry={entry}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </div>
    );
});

// ─── Main Component ──────────────────────────────────────────────────
export function DeviceDetail() {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const { tickets, addTicket } = useTickets();
    const { devices } = useDevicesSites();

    const [selectedRecording, setSelectedRecording] = useState<RecordingDay | null>(null);
    const [ticketCreated, setTicketCreated] = useState(false);
    const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'medium',
    });
    const [selectedMonth, setSelectedMonth] = useState(() => new Date(2026, 1, 1)); // Feb 2026

    // Stable callback for memoized calendar cells
    const handleSelectRecording = useCallback((entry: RecordingDay) => {
        setSelectedRecording(entry);
        setTicketCreated(false);
    }, []);

    const device = devices.find((d) => d.id === deviceId);
    const deviceTickets = tickets.filter((t) => t.deviceId === deviceId);
    const cameras = deviceCameras.filter((c) => c.deviceId === deviceId);
    const stats = deviceStatsData.find((s) => s.deviceId === deviceId);
    const timeline = healthTimelineEvents
        .filter((e) => e.deviceId === deviceId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const recordingData = useMemo(() => {
        if (!deviceId) return [];
        const allData = generateRecordingCalendar(deviceId);

        // Retention Policy: Data older than 1 year is deleted/unavailable
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);

        return allData.map(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate < oneYearAgo) {
                return { ...entry, status: 'no_data' as const };
            }
            return entry;
        });
    }, [deviceId]);

    // Optimize lookup for recording data to prevent rendering lag/crashes
    const recordingDataMap = useMemo(() => {
        const map = new Map<string, RecordingDay>();
        // Using O(N) only once here instead of O(N^2) during render
        recordingData.forEach((r) => {
            map.set(`${r.cameraId}-${r.date}`, r);
        });
        return map;
    }, [recordingData]);

    // Build the date range for the selected month
    const dateRange = useMemo(() => {
        const dates: string[] = [];
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }, [selectedMonth]);

    // Unique camera IDs for the calendar rows
    const calendarCameras = useMemo(() => {
        const map = new Map<string, string>();
        recordingData.forEach((r) => map.set(r.cameraId, r.cameraName));
        return Array.from(map.entries());
    }, [recordingData]);

    // Dynamic Month boundaries based on Retention (1 Year)
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const selectedYM = selectedMonth.getFullYear() * 12 + selectedMonth.getMonth();
    const earliestYM = oneYearAgo.getFullYear() * 12 + oneYearAgo.getMonth();
    const latestYM = currentDate.getFullYear() * 12 + currentDate.getMonth();

    const canGoPrev = selectedYM > earliestYM;
    const canGoNext = selectedYM < latestYM;

    const goToPrevMonth = () => {
        if (!canGoPrev) return;
        setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const goToNextMonth = () => {
        if (!canGoNext) return;
        setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!device) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Device not found</h2>
                <Button variant="outline" onClick={() => navigate('/devices')} className="mt-4">
                    Back to Devices
                </Button>
            </div>
        );
    }

    const uptimeColor = (stats?.uptimePercent ?? 0) >= 99 ? 'text-emerald-600 dark:text-emerald-400'
        : (stats?.uptimePercent ?? 0) >= 90 ? 'text-amber-600 dark:text-amber-400'
            : 'text-red-600 dark:text-red-400';

    const hddColor = (stats?.hddFreePercent ?? 0) >= 50 ? 'bg-emerald-500'
        : (stats?.hddFreePercent ?? 0) >= 20 ? 'bg-amber-500'
            : 'bg-red-500';

    const handleCreateTicket = () => {
        if (!selectedRecording || !device) return;

        addTicket({
            id: `tkt-${crypto.randomUUID()}`,
            title: `Missing Recording: ${selectedRecording.cameraName}`,
            description: `Recording data missing for camera ${selectedRecording.cameraName} on ${formatDate(selectedRecording.date)}.`,
            priority: 'medium',
            status: 'open',
            assignee: 'Unassigned',
            deviceId: device.id,
            deviceName: device.name,
            siteName: device.siteName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
        });

        setTicketCreated(true);
        setTimeout(() => {
            setTicketCreated(false);
            setSelectedRecording(null);
        }, 2000);
    };

    const handleCreateGeneralTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!device) return;

        addTicket({
            id: `TKT-${crypto.randomUUID()}`,
            title: newTicket.title,
            description: newTicket.description,
            priority: newTicket.priority as any,
            status: 'open',
            assignee: 'Unassigned',
            deviceId: device.id,
            deviceName: device.name,
            siteName: device.siteName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
        });

        setShowCreateTicketModal(false);
        setNewTicket({ title: '', description: '', priority: 'medium' });
    };

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
            </button>

            {/* Device Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/80 dark:border dark:border-slate-700/50 rounded-xl">
                        <Camera className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{device.name}</h1>
                            <StatusBadge status={device.status} />
                            <HealthBadge health={device.health} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{device.siteName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {device.ipAddress}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last seen: {formatDateTime(device.lastSeen)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                        Refresh
                    </Button>
                    <Button variant="outline" icon={<Settings className="w-4 h-4" />}>
                        Configure
                    </Button>
                </div>
            </div>

            {/* ─── Summary Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${device.status === 'online'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30'
                                : device.status === 'warning'
                                    ? 'bg-amber-50 dark:bg-amber-900/30'
                                    : 'bg-red-50 dark:bg-red-900/30'
                                }`}>
                                {device.status === 'online'
                                    ? <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    : device.status === 'warning'
                                        ? <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        : <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                                }
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{device.status}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Uptime */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Uptime</p>
                                <p className={`text-lg font-bold ${uptimeColor}`}>
                                    {stats?.uptimePercent.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* HDD Free */}
                <Card>
                    <CardBody>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                                    <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">HDD Free</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {stats?.hddFreePercent}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                    className={`${hddColor} h-1.5 rounded-full transition-all`}
                                    style={{ width: `${stats?.hddFreePercent ?? 0}%` }}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Temperature */}
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                                <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Temperature</p>
                                <p className={`text-lg font-bold ${(stats?.temperature ?? 0) > 50
                                    ? 'text-red-600 dark:text-red-400'
                                    : (stats?.temperature ?? 0) > 40
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {stats?.temperature}°C
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* ─── Device Info & Camera List ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Information */}
                <Card>
                    <CardHeader>Device Information</CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {[
                                ['Device ID', device.id, true],
                                ['Type', device.type.toUpperCase(), false],
                                ['Model', device.model, false],
                                ['Firmware', device.firmware, false],
                                ['IP Address', device.ipAddress, true],
                                ['Site', device.siteName, false],
                                ['Recording', device.recordingStatus.replace('_', ' '), false],
                            ].map(([label, value, mono], idx, arr) => (
                                <div
                                    key={label as string}
                                    className={`flex justify-between py-2 ${idx < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/50' : ''}`}
                                >
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{label as string}</span>
                                    <span className={`text-sm font-medium text-slate-900 dark:text-white ${mono ? 'font-mono' : ''} capitalize`}>
                                        {value as string}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Camera List */}
                <Card>
                    <CardHeader>
                        Connected Cameras ({cameras.length})
                    </CardHeader>
                    <CardBody>
                        {cameras.length === 0 ? (
                            <div className="text-center py-8">
                                <Camera className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No cameras connected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cameras.map((cam) => (
                                    <div
                                        key={cam.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-transparent dark:border-slate-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${cam.status === 'online'
                                                ? 'bg-emerald-500'
                                                : cam.status === 'warning'
                                                    ? 'bg-amber-500'
                                                    : 'bg-red-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {cam.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Ch{cam.channel} • {cam.type.toUpperCase()} • {cam.resolution}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge status={cam.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* ─── Health Timeline ────────────────────────────────────────── */}
            <Card>
                <CardHeader>Health Timeline</CardHeader>
                <CardBody>
                    {timeline.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
                            No events recorded
                        </p>
                    ) : (
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[17px] top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                {timeline.map((event, idx) => (
                                    <div key={event.id} className="flex items-start gap-4 relative">
                                        {/* Icon circle */}
                                        <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 bg-white dark:bg-slate-800 ${severityBorder[event.severity]}`}>
                                            <TimelineIcon event={event} />
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 pt-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {event.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDateTime(event.timestamp)}
                                                </span>
                                                <Badge
                                                    variant={
                                                        event.severity === 'error' ? 'danger'
                                                            : event.severity === 'warning' ? 'warning'
                                                                : event.severity === 'success' ? 'success'
                                                                    : 'info'
                                                    }
                                                    size="sm"
                                                >
                                                    {event.type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* ─── Recording Availability Calendar (1 Year) ────────────────── */}
            <Card>
                <CardHeader>
                    Recording Availability
                </CardHeader>
                <CardBody>
                    {calendarCameras.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
                            No camera data available
                        </p>
                    ) : (
                        <>
                            {/* Month Navigation + Legend */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={goToPrevMonth}
                                        disabled={!canGoPrev}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-[140px] text-center">
                                        {monthLabel}
                                    </span>
                                    <button
                                        onClick={goToNextMonth}
                                        disabled={!canGoNext}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-red-500" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Missing</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400">No Data</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="overflow-x-auto">
                                <div className="min-w-[700px]">
                                    {/* Date Header Row */}
                                    <div className="flex">
                                        <div className="w-32 flex-shrink-0" />
                                        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${dateRange.length}, 1fr)` }}>
                                            {dateRange.map((date) => {
                                                const d = new Date(date);
                                                return (
                                                    <div key={date} className="text-center px-0.5">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                            {d.getDate()}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Camera Rows (memoized) */}
                                    {calendarCameras.map(([camId, camName]) => (
                                        <CameraRow
                                            key={camId}
                                            camId={camId}
                                            camName={camName}
                                            dateRange={dateRange}
                                            recordingDataMap={recordingDataMap}
                                            onSelect={handleSelectRecording}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Summary Bar */}
                            {(() => {
                                // Strict Retention Logic: Calculate Summary only for the valid retention window
                                // Valid Window = [max(MonthStart, 1YearAgo), min(MonthEnd, Today)]

                                const now = new Date();
                                const oneYearAgo = new Date();
                                oneYearAgo.setFullYear(now.getFullYear() - 1);
                                oneYearAgo.setHours(0, 0, 0, 0);
                                now.setHours(23, 59, 59, 999); // Include today

                                const monthStart = new Date(dateRange[0]);
                                const monthEnd = new Date(dateRange[dateRange.length - 1]);
                                monthEnd.setHours(23, 59, 59, 999);

                                // Intersect ranges
                                const start = monthStart > oneYearAgo ? monthStart : oneYearAgo;
                                const end = monthEnd < now ? monthEnd : now;

                                // If intersection is invalid (e.g. future month or too old), return empty/grey
                                if (start > end) return null;

                                const validDaysCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                const totalCapacity = validDaysCount * cameras.length;

                                if (totalCapacity <= 0) return null;

                                // Filter recording data within strict window
                                let available = 0;
                                let missing = 0;

                                // Iterate valid window days
                                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                    const dateStr = d.toISOString().split('T')[0];
                                    cameras.forEach(cam => {
                                        const entry = recordingDataMap.get(`${cam.id}-${dateStr}`);
                                        if (entry?.status === 'available') {
                                            available++;
                                        }
                                        // Anything else in valid window is considered Missing (including explicit 'missing' or 'no_data')
                                        else {
                                            missing++;
                                        }
                                    });
                                }

                                const pctAvail = Math.round((available / totalCapacity) * 100);
                                const pctMissing = Math.round((missing / totalCapacity) * 100);
                                return (
                                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                            Monthly Summary (Retention Period Only)
                                        </p>
                                        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                            <div className="bg-emerald-500" style={{ width: `${pctAvail}%` }} />
                                            <div className="bg-red-500" style={{ width: `${pctMissing}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                            <span>{pctAvail}% Available</span>
                                            <span>{pctMissing}% Missing</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* ─── Related Tickets ────────────────────────────────────────── */}
            <Card>
                <CardHeader
                    action={
                        <Button variant="ghost" size="sm" onClick={() => setShowCreateTicketModal(true)}>
                            Create Ticket
                        </Button>
                    }
                >
                    Related Tickets
                </CardHeader>
                <CardBody>
                    {deviceTickets.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No open tickets</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                This device has no associated tickets
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {deviceTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-transparent dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {ticket.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {ticket.id} • {ticket.assignee}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                ticket.priority === 'critical' ? 'danger'
                                                    : ticket.priority === 'high' ? 'warning'
                                                        : ticket.priority === 'medium' ? 'info'
                                                            : 'success'
                                            }
                                            size="sm"
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* ─── Missing Recording Modal ────────────────────────────────── */}
            <Modal
                isOpen={!!selectedRecording}
                onClose={() => setSelectedRecording(null)}
                title="Missing Recording"
                size="sm"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setSelectedRecording(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCreateTicket}
                            disabled={ticketCreated}
                            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${ticketCreated
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {ticketCreated ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Ticket Created
                                </>
                            ) : (
                                'Create Ticket'
                            )}
                        </button>
                    </div>
                }
            >
                {selectedRecording && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    Recording Gap Detected
                                </span>
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-300">
                                No recording data found for this camera on the specified date.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Date</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {formatDate(selectedRecording.date)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Camera</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {selectedRecording.cameraName}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Device</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {device.name}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Site</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {device.siteName}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ─── General Ticket Modal ───────────────────────────────────── */}
            <Modal
                isOpen={showCreateTicketModal}
                onClose={() => setShowCreateTicketModal(false)}
                title="Create New Ticket"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCreateTicketModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={(e) => {
                            handleCreateGeneralTicket(e as any);
                        }}>Create Ticket</Button>
                    </div>
                }
            >
                <form onSubmit={handleCreateGeneralTicket} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Title</label>
                        <Input
                            value={newTicket.title}
                            onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                            placeholder="Brief summary of the issue"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Description</label>
                        <Input
                            value={newTicket.description}
                            onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                            placeholder="Detailed description"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Priority</label>
                        <Select
                            value={newTicket.priority}
                            onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                            options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                                { value: 'critical', label: 'Critical' },
                            ]}
                        />
                    </div>
                </form>
            </Modal>
        </div >
    );
}
