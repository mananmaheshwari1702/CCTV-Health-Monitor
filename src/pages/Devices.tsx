import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HardDrive,
    Search,
    Camera,
    Server,
    Monitor,
    Network,
} from 'lucide-react';
import {
    Card,
    CardBody,
    Badge,
    StatusBadge,
    HealthBadge,
    SearchInput,
    Select,
    Table,
    Pagination,
} from '../components/ui';
import { devices, sites } from '../data/mockData';
import type { Device } from '../types';

const ITEMS_PER_PAGE = 10;

const typeIcons: Record<Device['type'], React.ReactNode> = {
    camera: <Camera className="w-4 h-4" />,
    nvr: <Server className="w-4 h-4" />,
    dvr: <Monitor className="w-4 h-4" />,
    switch: <Network className="w-4 h-4" />,
};

function timeAgo(dateStr: string): string {
    const now = new Date('2026-02-09T14:15:00Z');
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
}

export function Devices() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [siteFilter, setSiteFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const filteredDevices = useMemo(() => {
        let result = [...devices];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (d) =>
                    d.name.toLowerCase().includes(q) ||
                    d.ipAddress.toLowerCase().includes(q) ||
                    d.siteName.toLowerCase().includes(q)
            );
        }

        // Site filter
        if (siteFilter !== 'all') {
            result = result.filter((d) => d.siteId === siteFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter((d) => d.status === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            const aVal = String(a[sortColumn as keyof Device] ?? '');
            const bVal = String(b[sortColumn as keyof Device] ?? '');
            const cmp = aVal.localeCompare(bVal);
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [searchQuery, siteFilter, statusFilter, sortColumn, sortDirection]);

    const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Status counts for the summary cards
    const statusCounts = useMemo(() => {
        const counts = { total: devices.length, online: 0, offline: 0, warning: 0 };
        devices.forEach((d) => {
            if (d.status === 'online') counts.online++;
            else if (d.status === 'offline') counts.offline++;
            else counts.warning++;
        });
        return counts;
    }, []);

    const columns = [
        {
            key: 'name' as keyof Device,
            header: 'Device',
            sortable: true,
            render: (device: Device) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        {typeIcons[device.type]}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {device.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            {device.type} • {device.model}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'siteName' as keyof Device,
            header: 'Site',
            sortable: true,
            render: (device: Device) => (
                <span className="text-slate-700 dark:text-slate-300">{device.siteName}</span>
            ),
        },
        {
            key: 'ipAddress' as keyof Device,
            header: 'IP Address',
            sortable: true,
            render: (device: Device) => (
                <span className="font-mono text-slate-600 dark:text-slate-400 text-xs">
                    {device.ipAddress}
                </span>
            ),
        },
        {
            key: 'status' as keyof Device,
            header: 'Status',
            sortable: true,
            render: (device: Device) => <StatusBadge status={device.status} />,
        },
        {
            key: 'health' as keyof Device,
            header: 'Health',
            sortable: true,
            render: (device: Device) => <HealthBadge health={device.health} />,
        },
        {
            key: 'lastSeen' as keyof Device,
            header: 'Last Seen',
            sortable: true,
            render: (device: Device) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {timeAgo(device.lastSeen)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Devices</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Monitor and manage all connected devices across your sites.
                </p>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{statusCounts.total}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{statusCounts.online}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Offline</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{statusCounts.offline}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Warning</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{statusCounts.warning}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 max-w-md">
                    <SearchInput
                        placeholder="Search devices, IPs, sites..."
                        onSearch={(q) => {
                            setSearchQuery(q);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="flex gap-3">
                    <Select
                        value={siteFilter}
                        onChange={(e) => {
                            setSiteFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: 'all', label: 'All Sites' },
                            ...sites.map((site) => ({
                                value: site.id,
                                label: site.name,
                            })),
                        ]}
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'online', label: 'Online' },
                            { value: 'offline', label: 'Offline' },
                            { value: 'warning', label: 'Warning' },
                        ]}
                    />
                </div>
            </div>

            {/* Device Table */}
            <Table<Device>
                data={paginatedDevices}
                columns={columns}
                keyExtractor={(d) => d.id}
                onRowClick={(d) => navigate(`/devices/${d.id}`)}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                emptyMessage="No devices match your filters"
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredDevices.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}
        </div>
    );
}
