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
} from 'lucide-react';
import { StatsCard, Card, CardHeader, CardBody, Badge, Button } from '../components/ui';
import { dashboardStats, alerts, tickets } from '../data/mockData';

export function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Open Tickets</p>
                            <p className="text-4xl font-bold mt-1">{dashboardStats.openTickets}</p>
                        </div>
                        <Ticket className="w-10 h-10 text-blue-300" />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            {dashboardStats.criticalTickets} Critical
                        </span>
                        <span className="text-blue-200 text-sm">needs attention</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Resolution Rate</p>
                            <p className="text-xs text-slate-500">Last 7 days</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">87.5%</p>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.5%' }} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Avg. Response Time</p>
                            <p className="text-xs text-slate-500">Last 7 days</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">2.4h</p>
                    <p className="text-sm text-emerald-600 mt-2">↓ 15% from last week</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Alerts */}
                <Card className="lg:col-span-2">
                    <CardHeader action={
                        <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View all
                        </Link>
                    }>
                        Recent Alerts
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {alerts.map((alert) => {
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
                                        className={`flex items-start gap-3 p-3 rounded-lg border ${bgColors[alert.type]}`}
                                    >
                                        {icons[alert.type]}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
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
                        <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
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
                                    <div className="flex items-center justify-between text-xs text-slate-500">
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
                            to="/sites"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Camera className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">View Devices</span>
                        </Link>
                        <Link
                            to="/tickets"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="p-3 bg-emerald-100 rounded-full">
                                <Ticket className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">New Ticket</span>
                        </Link>
                        <Link
                            to="/reports"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="p-3 bg-purple-100 rounded-full">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Run Report</span>
                        </Link>
                        <Link
                            to="/users"
                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="p-3 bg-amber-100 rounded-full">
                                <HeartCrack className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Health Check</span>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
