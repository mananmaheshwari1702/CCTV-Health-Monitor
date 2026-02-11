import React from 'react';
import { Link } from 'react-router-dom';
import {
    Camera,
    Wifi,
    WifiOff,
    Heart,
    HeartCrack,
    VideoOff,
    Ticket,
    AlertTriangle,
    AlertCircle,
    Info,
    ArrowRight,
    TrendingUp,
    Clock,
    Activity,
    CheckCircle,
    Server,
    HardDrive,
    Shield
} from 'lucide-react';
import { StatsCard, Card, CardHeader, CardBody, Badge, Button } from '../components/ui';
import { useData } from '../context/DataContext';
import { AlertBanner } from '../components/dashboard/AlertBanner';

export function Dashboard() {
    const { dashboardStats, alerts, tickets } = useData();

    // Get only active/recent alerts for display
    const recentAlerts = alerts.slice(0, 5);

    return (
        <div className="space-y-6">
            <AlertBanner />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                <StatsCard
                    title="Total Devices"
                    value={dashboardStats.totalDevices}
                    icon={Camera}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-50"
                    trend={{ value: 12, label: 'from last month', direction: 'up' }}
                />
                <StatsCard
                    title="Online Devices"
                    value={dashboardStats.onlineDevices}
                    subtitle={`${Math.round((dashboardStats.onlineDevices / dashboardStats.totalDevices) * 100)}% uptime`}
                    icon={Wifi}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-emerald-50"
                />
                <StatsCard
                    title="Offline Devices"
                    value={dashboardStats.offlineDevices}
                    icon={WifiOff}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-50"
                />
                <StatsCard
                    title="Healthy Cameras"
                    value={dashboardStats.healthyDevices}
                    subtitle={`${dashboardStats.faultyDevices} faulty`}
                    icon={Heart}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-emerald-50"
                />
                <StatsCard
                    title="Recording Missing"
                    value={dashboardStats.recordingMissing}
                    subtitle="Today"
                    icon={VideoOff}
                    iconColor="text-amber-600"
                    iconBgColor="bg-amber-50"
                />
            </div>

            {/* Tickets Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg shadow-blue-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Open Tickets</p>
                            <p className="text-4xl font-bold mt-1 text-white">{dashboardStats.openTickets}</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Ticket className="w-8 h-8 text-blue-100" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            {dashboardStats.criticalTickets} Critical
                        </span>
                        <span className="text-blue-200 text-sm">needs attention</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Resolution Rate</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">87.5%</p>
                    <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.5%' }} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Avg. Response Time</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">2.4h</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">↓ 15% from last week</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts */}
                <Card className="lg:col-span-2">
                    <CardHeader action={
                        <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            View all
                        </Link>
                    }>
                        Recent Alerts
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {recentAlerts.map((alert) => {
                                const icons = {
                                    error: <AlertCircle className="w-5 h-5 text-red-500" />,
                                    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
                                    info: <Info className="w-5 h-5 text-blue-500" />,
                                };
                                const bgColors = {
                                    error: 'bg-red-50 border-red-100',
                                    warning: 'bg-amber-50 border-amber-100',
                                    info: 'bg-blue-50 border-blue-100',
                                };

                                return (
                                    <div
                                        key={alert.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border ${bgColors[alert.type]} dark:bg-slate-800/50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                                    >
                                        {icons[alert.type]}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.message}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {alert.deviceName} • {alert.siteName}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(alert.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Open Tickets */}
                <Card>
                    <CardHeader action={
                        <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            View all
                        </Link>
                    }>
                        Latest Tickets
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {tickets.slice(0, 4).map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-900/30 border border-transparent dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                                            {ticket.title}
                                        </p>
                                        <Badge
                                            variant={
                                                ticket.priority === 'critical'
                                                    ? 'danger'
                                                    : ticket.priority === 'high'
                                                        ? 'warning'
                                                        : 'neutral'
                                            }
                                            size="sm"
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>{ticket.siteName}</span>
                                        <span>{ticket.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Link to="/tickets">
                                <Button variant="outline" fullWidth size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                                    Create Ticket
                                </Button>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>Quick Actions</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            to="/devices"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                        >
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Devices</span>
                        </Link>
                        <Link
                            to="/tickets"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                        >
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Tickets</span>
                        </Link>
                        <Link
                            to="/reports"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                        >
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Run Report</span>
                        </Link>
                        <Link
                            to="/alerts"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                        >
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <HeartCrack className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Alerts</span>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
