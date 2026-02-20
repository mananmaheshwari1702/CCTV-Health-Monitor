import React, { useState, useMemo, useEffect } from 'react';
import {
    AlertTriangle,
    AlertCircle,
    Info,
    Filter,
    Clock,
    Trash2,
    Bell,
    Check,
    CheckCircle
} from 'lucide-react';
import { Card, CardBody, Table, Pagination, Badge, Button, Select, SearchInput, ConfirmModal } from '../components/ui';
import { useAlerts } from '../context/DataContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import type { Alert } from '../types';

export function Alerts() {
    const { alerts, updateAlertStatus, deleteAlert } = useAlerts();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

    const ITEMS_PER_PAGE = 10;

    const handleAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
        const newStatus = action === 'acknowledge' ? 'acknowledged' : 'resolved';
        updateAlertStatus(alertId, newStatus);
    };

    const filteredAlerts = useMemo(() => {
        let result = alerts.filter(alert => {
            const matchesSearch =
                alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.siteName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'all' || alert.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        result.sort((a, b) => {
            if (sortColumn === 'timestamp') {
                const aTime = new Date(a.timestamp).getTime();
                const bTime = new Date(b.timestamp).getTime();
                return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
            }

            const aVal = String(a[sortColumn as keyof Alert] ?? '');
            const bVal = String(b[sortColumn as keyof Alert] ?? '');
            const cmp = aVal.localeCompare(bVal);
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [alerts, searchTerm, typeFilter, statusFilter, sortColumn, sortDirection]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const statusCounts = useMemo(() => {
        const counts = { total: filteredAlerts.length, active: 0, acknowledged: 0, resolved: 0 };
        filteredAlerts.forEach((a) => {
            if (a.status === 'active') counts.active++;
            else if (a.status === 'acknowledged') counts.acknowledged++;
            else if (a.status === 'resolved') counts.resolved++;
        });
        return counts;
    }, [filteredAlerts]);

    const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
    const paginatedAlerts = filteredAlerts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Clamp currentPage to valid range when data changes
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(Math.max(1, totalPages));
        }
    }, [totalPages, currentPage]);

    const columns = [
        {
            key: 'type' as keyof Alert,
            header: 'Severity',
            sortable: true,
            render: (alert: Alert) => {
                const config = {
                    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Error' },
                    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Warning' },
                    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Info' }
                }[alert.type];
                const Icon = config.icon;
                return (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <div className={`p-1.5 rounded-lg inline-flex items-center justify-center ${config.bg}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                    </div>
                );
            }
        },
        {
            key: 'message' as keyof Alert,
            header: 'Message',
            sortable: true,
            render: (alert: Alert) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{alert.message}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {alert.deviceName} • {alert.siteName}
                    </div>
                </div>
            )
        },
        {
            key: 'status' as keyof Alert,
            header: 'Status',
            sortable: true,
            render: (alert: Alert) => {
                const styles = {
                    active: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
                    acknowledged: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                }[alert.status];
                return (
                    <Badge className={styles}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </Badge>
                );
            }
        },
        {
            key: 'timestamp' as keyof Alert,
            header: 'Time',
            sortable: true,
            render: (alert: Alert) => (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(alert.timestamp).toLocaleString()}
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            align: 'right' as const,
            render: (alert: Alert) => (
                <div className="flex justify-end gap-2">
                    {alert.status === 'active' && (
                        <PermissionGuard requiredRole={['admin', 'manager', 'technician']}>
                            <button
                                className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors group"
                                onClick={(e) => { e.stopPropagation(); handleAction(alert.id, 'acknowledge'); }}
                                title="Acknowledge Alert"
                            >
                                <Check className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:text-slate-500 dark:group-hover:text-amber-400" />
                            </button>
                        </PermissionGuard>
                    )}
                    {alert.status !== 'resolved' && (
                        <PermissionGuard requiredRole={['admin', 'manager', 'technician']}>
                            <button
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors group"
                                onClick={(e) => { e.stopPropagation(); handleAction(alert.id, 'resolve'); }}
                                title="Resolve Alert"
                            >
                                <CheckCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400" />
                            </button>
                        </PermissionGuard>
                    )}
                    <PermissionGuard requiredRole={['admin']}>
                        <button
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ isOpen: true, id: alert.id });
                            }}
                            title="Delete Alert"
                        >
                            <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 dark:text-slate-500 dark:group-hover:text-red-400" />
                        </button>
                    </PermissionGuard>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Alerts</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and manage critical system events</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filter
                    </Button>
                </div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Alerts</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{statusCounts.total}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{statusCounts.active}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Acknowledged</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{statusCounts.acknowledged}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Resolved</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{statusCounts.resolved}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Search</label>
                        <SearchInput
                            placeholder="Search alerts..."
                            onSearch={setSearchTerm}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'acknowledged', label: 'Acknowledged' },
                                    { value: 'resolved', label: 'Resolved' },
                                ]}
                            />
                        </div>
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Severity</label>
                            <Select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Severities' },
                                    { value: 'error', label: 'Error' },
                                    { value: 'warning', label: 'Warning' },
                                    { value: 'info', label: 'Info' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardBody className="p-0">
                    <Table
                        data={paginatedAlerts}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        emptyMessage="No alerts found matching your criteria."
                    />
                </CardBody>
            </Card>

            {filteredAlerts.length > ITEMS_PER_PAGE && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredAlerts.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}

            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
                onConfirm={() => { if (deleteConfirm.id) deleteAlert(deleteConfirm.id); }}
                title="Delete Alert"
                message="Are you sure you want to delete this alert?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
