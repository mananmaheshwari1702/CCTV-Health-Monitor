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
import { reports } from '../data/mockData';

export function Reports() {
    const [selectedPeriod, setSelectedPeriod] = useState('last_7_days');

    const reportIcons = {
        health: TrendingUp,
        uptime: Shield,
        recording: Video,
        tickets: Ticket,
        custom: FileText,
    };

    const reportColors = {
        health: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
        uptime: { bg: 'bg-blue-50', icon: 'text-blue-600' },
        recording: { bg: 'bg-purple-50', icon: 'text-purple-600' },
        tickets: { bg: 'bg-amber-50', icon: 'text-amber-600' },
        custom: { bg: 'bg-slate-50', icon: 'text-slate-600' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
                    <p className="text-sm text-slate-500 mt-1">
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
                    <Button variant="outline" icon={<Calendar className="w-4 h-4" />}>
                        Schedule
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">24</p>
                                <p className="text-sm text-slate-500">Reports Generated</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Play className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">4</p>
                                <p className="text-sm text-slate-500">Scheduled Active</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Download className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">156</p>
                                <p className="text-sm text-slate-500">Total Downloads</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">2h ago</p>
                                <p className="text-sm text-slate-500">Last Generated</p>
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
                                                <h3 className="font-semibold text-slate-900">
                                                    {report.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {report.description}
                                                </p>
                                            </div>
                                            <Badge variant="neutral" size="sm">
                                                {report.schedule}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
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
                                    <Button variant="primary" size="sm" icon={<Play className="w-4 h-4" />}>
                                        Generate Now
                                    </Button>
                                    <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                                        Download Last
                                    </Button>
                                    <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>
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
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">
                            Build a Custom Report
                        </h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Create custom reports by selecting specific metrics, sites, and date
                            ranges to analyze your surveillance data.
                        </p>
                        <Button className="mt-6">Create Custom Report</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
