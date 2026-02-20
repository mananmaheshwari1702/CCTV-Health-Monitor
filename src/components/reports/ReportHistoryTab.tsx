import React from 'react';
import { Card, CardBody, Button, Badge } from '../ui';
import { Download, FileText, Calendar, Clock, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../ui';

// Mock report history data
const mockReportHistory = [
    {
        id: 'rh-001',
        name: 'Weekly Management Overview',
        type: 'Consolidated Health',
        format: 'xlsx',
        dateRange: 'Feb 10 - Feb 16, 2026',
        generatedAt: '2026-02-16T08:05:22Z',
        generatedBy: 'System Schedule',
        status: 'ready',
        size: '2.4 MB'
    },
    {
        id: 'rh-002',
        name: 'Manual: Camera Health',
        type: 'Camera Health',
        format: 'xlsx',
        dateRange: 'Jan 1 - Jan 31, 2026',
        generatedAt: '2026-02-15T14:32:01Z',
        generatedBy: 'John Smith',
        status: 'ready',
        size: '1.1 MB'
    },
    {
        id: 'rh-003',
        name: 'Daily Region 1 Camera Status',
        type: 'Camera Health',
        format: 'pdf',
        dateRange: 'Feb 14, 2026',
        generatedAt: '2026-02-15T06:01:15Z',
        generatedBy: 'System Schedule',
        status: 'ready',
        size: '450 KB'
    },
    {
        id: 'rh-004',
        name: 'Storage Compliance Audit',
        type: 'Recording Availability',
        format: 'xlsx',
        dateRange: 'Nov 1, 2025 - Jan 31, 2026',
        generatedAt: '2026-02-14T09:15:00Z',
        generatedBy: 'Sarah Johnson',
        status: 'expired',
        size: '5.8 MB'
    }
];

export function ReportHistoryTab() {
    const toast = useToast();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Report History</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Access previously generated reports (available for 30 days).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {mockReportHistory.map((report) => (
                    <Card key={report.id} variant="bordered" className="hover:border-blue-500/50 transition-colors">
                        <CardBody className="p-4 md:p-5">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl shrink-0 ${report.format === 'xlsx' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                        'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                        }`}>
                                        {report.format === 'xlsx' ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">{report.name}</h4>
                                            {report.status === 'expired' && (
                                                <Badge variant="neutral" size="sm">Expired</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {report.dateRange}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Generated: {new Date(report.generatedAt).toLocaleString()}
                                            </span>
                                            <span className="hidden md:inline">•</span>
                                            <span>By: {report.generatedBy}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                            Type: {report.type} • Size: {report.size}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex justify-end mt-2 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-700/50">
                                    <Button
                                        variant={report.status === 'ready' ? 'outline' : 'ghost'}
                                        size="sm"
                                        icon={<Download className="w-4 h-4" />}
                                        disabled={report.status === 'expired'}
                                        className={report.status === 'expired' ? 'opacity-50' : ''}
                                        onClick={() => {
                                            if (report.status === 'ready') {
                                                toast.info(`Generating ${report.name}...`);
                                                setTimeout(() => {
                                                    toast.success('Report download complete.');
                                                }, 1500);
                                            }
                                        }}
                                    >
                                        Download {report.format.toUpperCase()}
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
