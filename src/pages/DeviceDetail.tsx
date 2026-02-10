import React from 'react';
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
} from '../components/ui';
import { devices, tickets } from '../data/mockData';

export function DeviceDetail() {
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const device = devices.find((d) => d.id === deviceId);
    const deviceTickets = tickets.filter((t) => t.deviceId === deviceId);

    if (!device) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Device not found</h2>
                <Button variant="outline" onClick={() => navigate('/sites')} className="mt-4">
                    Back to Sites
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/sites')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Sites</span>
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
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{device.siteName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {device.ipAddress}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last seen: {new Date(device.lastSeen).toLocaleString()}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                {device.status === 'online' ? (
                                    <Wifi className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <WifiOff className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Connection</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                    {device.status}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                {device.health === 'healthy' ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                ) : device.health === 'degraded' ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Health</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                    {device.health}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Video className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Recording</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                                    {device.recordingStatus.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <HardDrive className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Storage</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">72%</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Device Info & Tickets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Information */}
                <Card>
                    <CardHeader>Device Information</CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Device ID</span>
                                <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                                    {device.id}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Type</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white uppercase">
                                    {device.type}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Model</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {device.model}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Firmware</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {device.firmware}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">IP Address</span>
                                <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                                    {device.ipAddress}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Site</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {device.siteName}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Related Tickets */}
                <Card>
                    <CardHeader
                        action={
                            <Button variant="ghost" size="sm">
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
                                <p className="text-sm font-medium text-slate-700">No open tickets</p>
                                <p className="text-xs text-slate-500 mt-1">
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
                                                    ticket.priority === 'critical' ? 'danger' : 'warning'
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
            </div>

            {/* Health History */}
            <Card>
                <CardHeader>Health History (Last 7 Days)</CardHeader>
                <CardBody>
                    <div className="flex items-end gap-1 h-32">
                        {[95, 98, 100, 100, 92, 88, 100].map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className={`w-full rounded-t ${value === 100
                                        ? 'bg-emerald-500'
                                        : value >= 90
                                            ? 'bg-amber-500'
                                            : 'bg-red-500'
                                        }`}
                                    style={{ height: `${value}%` }}
                                />
                                <span className="text-xs text-slate-500">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
