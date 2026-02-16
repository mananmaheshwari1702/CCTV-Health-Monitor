import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Clock,
    Play,
    Pause,
    Settings,
    TrendingUp,
    Shield,
    Video,
    Ticket,
    AlertTriangle,
    CheckCircle,
    Server
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Badge,
    Select,
} from '../components/ui';
import { useToast } from '../components/ui';
import { useSettings } from '../context/DataContext';
import { reports } from '../data/mockData';

export function Reports() {
    const [selectedPeriod, setSelectedPeriod] = useState('last_7_days');
    const toast = useToast();
    const { dashboardStats } = useSettings();

    const reportIcons = {
        health: TrendingUp,
        uptime: Shield,
        recording: Video,
        tickets: Ticket,
        custom: FileText,
    };

    const reportColors = {
        health: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400' },
        uptime: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400' },
        recording: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400' },
        tickets: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400' },
        custom: { bg: 'bg-slate-50 dark:bg-slate-800/50', icon: 'text-slate-600 dark:text-slate-300' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reports</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                        Generate and download system reports
                    </p>
                </div>
                <div className="flex gap-3">
                    <Select
                        options={[
                            { value: 'last_7_days', label: 'Last 7 Days' },
                            { value: 'last_30_days', label: 'Last 30 Days' },
                            { value: 'last_90_days', label: 'Last 90 Days' },
                            { value: 'custom', label: 'Custom Range' },
                        ]}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        icon={<Calendar className="w-4 h-4" />}
                        onClick={() => toast.info('Schedule Report feature coming soon!')}
                    >
                        Schedule
                    </Button>
                </div>
            </div>

            {/* Quick Stats (System Overview) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.totalDevices}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">Total Devices</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.criticalTickets}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">Critical Issues</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                                <Ticket className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.openTickets}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">Open Tickets</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.onlineDevices}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-300">Online Devices</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => {
                    const Icon = reportIcons[report.type];
                    const colors = reportColors[report.type];

                    return (
                        <Card key={report.id} variant="bordered">
                            <CardBody>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {report.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    {report.description}
                                                </p>
                                            </div>
                                            <Badge variant="neutral" size="sm">
                                                {report.schedule}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Last: {new Date(report.lastGenerated).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Play className="w-4 h-4" />}
                                        onClick={() => toast.success(`Generating ${report.name} report...`)}
                                    >
                                        Generate Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon={<Download className="w-4 h-4" />}
                                        onClick={() => toast.success(`Downloading last ${report.name} report...`)}
                                    >
                                        Download Last
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<Settings className="w-4 h-4" />}
                                        onClick={() => toast.info(`Configure ${report.name} report settings coming soon`)}
                                    >
                                        Configure
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Custom Report Builder */}
            <Card>
                <CardHeader>Custom Report Builder</CardHeader>
                <CardBody>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700/50">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                            Build a Custom Report
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                            Create custom reports by selecting specific metrics, sites, and date
                            ranges to analyze your surveillance data.
                        </p>
                        <Button
                            className="mt-6"
                            onClick={() => toast.info('Custom Report Builder coming soon!')}
                        >
                            Create Custom Report
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
