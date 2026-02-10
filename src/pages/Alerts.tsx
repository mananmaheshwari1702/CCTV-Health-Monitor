import React, { useState } from 'react';
import {
    AlertTriangle,
    AlertCircle,
    Info,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Trash2
} from 'lucide-react';
import { Card, CardHeader, CardBody, Table, Badge, Button, Input, Select, SearchInput } from '../components/ui';
import { useData } from '../context/DataContext';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import type { Alert, AlertStatus } from '../types';

export function Alerts() {
    const { alerts, updateAlertStatus, deleteAlert } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleAction = (alertId: string, action: 'acknowledge' | 'resolve') => {
        const newStatus = action === 'acknowledge' ? 'acknowledged' : 'resolved';
        updateAlertStatus(alertId, newStatus);
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch =
            alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.siteName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || alert.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const columns = [
        {
            key: 'type',
            header: 'Severity',
            render: (alert: Alert) => {
                const config = {
                    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }
                }[alert.type];
                const Icon = config.icon;
                return (
                    <div className={`p-2 rounded-lg inline-flex items-center justify-center ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                );
            }
        },
        {
            key: 'message',
            header: 'Message',
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
            key: 'status',
            header: 'Status',
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
            key: 'timestamp',
            header: 'Time',
            render: (alert: Alert) => (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(alert.timestamp).toLocaleString()}
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (alert: Alert) => (
                <div className="flex items-center gap-2">
                    {alert.status === 'active' && (
                        <PermissionGuard requiredRole={['admin', 'manager', 'technician']}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleAction(alert.id, 'acknowledge'); }}
                            >
                                Acknowledge
                            </Button>
                        </PermissionGuard>
                    )}
                    {alert.status !== 'resolved' && (
                        <PermissionGuard requiredRole={['admin', 'manager', 'technician']}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleAction(alert.id, 'resolve'); }}
                            >
                                Resolve
                            </Button>
                        </PermissionGuard>
                    )}
                    <PermissionGuard requiredRole={['admin']}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this alert?')) deleteAlert(alert.id);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </PermissionGuard>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Alerts</h1>
                    <p className="text-slate-500 dark:text-slate-400">Monitor and manage critical system events</p>
                </div>
                <div className="flex items-center gap-4">
                    <SearchInput
                        placeholder="Search alerts..."
                        onSearch={setSearchTerm}
                    />
                    <div className="w-48">
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
                    <div className="w-48">
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

            <Card>
                <CardBody className="p-0">
                    <Table
                        data={filteredAlerts}
                        columns={columns}
                        keyExtractor={(item) => item.id}
                        emptyMessage="No alerts found matching your criteria."
                    />
                </CardBody>
            </Card>
        </div>
    );
}
