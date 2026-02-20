import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Select, Input, Badge } from '../ui';
import { FileText, Download, Calendar, Search, Filter } from 'lucide-react';
import { useToast } from '../ui';
import { generateExcelReport } from '../../utils/reportGenerator';
import { useDevicesSites, useTickets } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parseISO, format } from 'date-fns';

export function ManualDownloadTab() {
    const toast = useToast();
    const { devices, sites } = useDevicesSites();
    const { tickets } = useTickets();
    const { user } = useAuth();

    const [reportType, setReportType] = useState('consolidated');
    const [duration, setDuration] = useState('last_3_months');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredSites, setFilteredSites] = useState('all');
    const [deviceType, setDeviceType] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [issueTypeFilter, setIssueTypeFilter] = useState('all');
    const [deviceNameQuery, setDeviceNameQuery] = useState('');
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        // Validate custom dates if selected
        if (duration === 'custom') {
            if (!startDate || !endDate) {
                toast.error('Please select both start and end dates for custom duration.');
                return;
            }
            if (new Date(startDate) > new Date(endDate)) {
                toast.error('Start date cannot be after end date.');
                return;
            }
            if (new Date(endDate) > new Date()) {
                toast.error('End date cannot be in the future.');
                return;
            }

            // Validate max 1 year retention window for custom dates
            const msInYear = 365 * 24 * 60 * 60 * 1000;
            if (new Date(endDate).getTime() - new Date(startDate).getTime() > msInYear) {
                toast.error('Custom date range cannot exceed 1 year of data retention.');
                return;
            }
        }

        setIsGenerating(true);
        toast.info('Generating report...');

        try {
            await generateExcelReport({
                type: reportType,
                duration,
                startDate,
                endDate,
                filters: {
                    site: filteredSites,
                    deviceType,
                    status: statusFilter,
                    issueType: issueTypeFilter,
                    deviceId: selectedDeviceId,
                },
                data: { devices, sites, tickets },
                userSites: user?.role === 'admin' ? [] : user?.sites || []
            });
            toast.success('Report generation complete.');
        } catch (error: any) {
            console.error('Report generation failed:', error);
            toast.error(error.message || 'Failed to generate report.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Download className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Manual Data Export</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Generate custom reports on demand based on specific criteria.</p>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="p-6 space-y-8 pb-8">
                {/* Section 1: Report Options */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        1. Select Report Type
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'consolidated', label: 'Consolidated Health Report', desc: 'All metrics combined' },
                            { id: 'dvr_nvr_health', label: 'DVR/NVR Health Report', desc: 'Recorders status & performance' },
                            { id: 'camera_health', label: 'Camera Health Report', desc: 'Camera connection & optics' },
                            { id: 'hdd_health', label: 'HDD/Storage Health Report', desc: 'Storage capacity & SMART status' },
                            { id: 'recording_availability', label: 'Recording Availability Rep.', desc: 'Available/missing recording days' },
                            { id: 'ticket_log', label: 'Ticket / Maintenance Log', desc: 'History of issues and resolutions' }
                        ].map(type => (
                            <div
                                key={type.id}
                                onClick={() => setReportType(type.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${reportType === type.id
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium ${reportType === type.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                        {type.label}
                                    </span>
                                    {reportType === type.id && (
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{type.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {/* Section 2: Duration Options */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            2. Select Duration
                        </h4>
                        <div className="space-y-4 max-w-sm">
                            <Select
                                label="Time Range Preset"
                                options={[
                                    { value: 'last_7_days', label: 'Last 7 Days' },
                                    { value: 'last_30_days', label: 'Last 30 Days' },
                                    { value: 'last_3_months', label: 'Last 3 Months (Recommended)' },
                                    { value: 'last_6_months', label: 'Last 6 Months' },
                                    { value: 'all_data', label: 'All Available Data' },
                                    { value: 'custom', label: 'Custom Date Range...' },
                                ]}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />

                            {duration === 'custom' && (
                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Start Date</label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={startDate ? parseISO(startDate) : null}
                                                onChange={(date: Date | null) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                                dateFormat="dd/MM/yyyy"
                                                maxDate={new Date()}
                                                placeholderText="dd/mm/yyyy"
                                                className="w-full px-3.5 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                calendarClassName="font-sans border-slate-200 shadow-lg rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">End Date</label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={endDate ? parseISO(endDate) : null}
                                                onChange={(date: Date | null) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                                dateFormat="dd/MM/yyyy"
                                                maxDate={new Date()}
                                                placeholderText="dd/mm/yyyy"
                                                className="w-full px-3.5 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                calendarClassName="font-sans border-slate-200 shadow-lg rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Filters */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            3. Apply Filters
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Region / Site"
                                options={[
                                    { value: 'all', label: 'All Accessible Sites' },
                                    ...sites
                                        .filter(s => user?.role === 'admin' || user?.sites?.includes(s.id))
                                        .map(s => ({ value: s.id, label: s.name }))
                                ]}
                                value={filteredSites}
                                onChange={(e) => setFilteredSites(e.target.value)}
                            />
                            <Select
                                label="Device Type"
                                options={[
                                    { value: 'all', label: 'All Device Types' },
                                    { value: 'camera', label: 'Cameras Only' },
                                    { value: 'nvr', label: 'NVRs Only' },
                                    { value: 'dvr', label: 'DVRs Only' },
                                ]}
                                value={deviceType}
                                onChange={(e) => setDeviceType(e.target.value)}
                                disabled={reportType === 'dvr_nvr_health' || reportType === 'camera_health'}
                            />
                            <Select
                                label="Current Status"
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'online', label: 'Healthy / Online' },
                                    { value: 'warning', label: 'Warning / Degraded' },
                                    { value: 'offline', label: 'Critical / Offline' },
                                ]}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                            <Select
                                label="Issue Type"
                                options={[
                                    { value: 'all', label: 'All Issues' },
                                    { value: 'offline', label: 'Network/Offline' },
                                    { value: 'storage', label: 'Storage/HDD Error' },
                                    { value: 'recording', label: 'Missing Recording' },
                                ]}
                                value={issueTypeFilter}
                                onChange={(e) => setIssueTypeFilter(e.target.value)}
                            />
                            <div className="relative">
                                <Input
                                    label="Device Name Search"
                                    placeholder="Type to search..."
                                    value={deviceNameQuery}
                                    onChange={(e) => {
                                        setDeviceNameQuery(e.target.value);
                                        setSelectedDeviceId('');
                                        setIsDeviceDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDeviceDropdownOpen(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsDeviceDropdownOpen(false), 200);
                                    }}
                                />
                                {isDeviceDropdownOpen && deviceNameQuery && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {devices
                                            .filter(d => (user?.role === 'admin' || user?.sites?.includes(d.siteId)))
                                            .filter(d => d.name.toLowerCase().includes(deviceNameQuery.toLowerCase()))
                                            .map(device => (
                                                <div
                                                    key={device.id}
                                                    className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex flex-col border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent input from losing focus immediately if needed, or just handle down
                                                        setDeviceNameQuery(device.name);
                                                        setSelectedDeviceId(device.id);
                                                        setIsDeviceDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{device.name}</span>
                                                    <span className="text-xs text-slate-500">{device.siteName} • {device.type.toUpperCase()}</span>
                                                </div>
                                            ))}
                                        {devices
                                            .filter(d => (user?.role === 'admin' || user?.sites?.includes(d.siteId)))
                                            .filter(d => d.name.toLowerCase().includes(deviceNameQuery.toLowerCase())).length === 0 && (
                                                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                                    No matching devices found.
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center py-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Ready to generate {reportType.replace(/_/g, ' ')}
                </span>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => toast.info('PDF export coming soon.')}>
                        Export PDF
                    </Button>
                    <Button
                        variant="primary"
                        icon={isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="min-w-[140px]"
                    >
                        {isGenerating ? 'Generating...' : 'Download Excel'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
