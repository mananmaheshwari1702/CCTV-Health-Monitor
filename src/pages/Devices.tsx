import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Server,
    Camera,
    Activity,
    Wifi,
    WifiOff,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Monitor,
    HardDrive,
    Edit,
    Trash2
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    Badge,
    StatusBadge,
    HealthBadge,
    Button,
    Input,
    Select,
    Table,
    SearchInput,
    Pagination,
    Modal,
    ConfirmModal
} from '../components/ui';
import { useDevicesSites } from '../context/DataContext';
import type { Device } from '../types';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { formatDistanceToNow } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const typeIcons = {
    camera: <Camera className="w-5 h-5 text-blue-500" />,
    nvr: <Server className="w-5 h-5 text-purple-500" />,
    dvr: <HardDrive className="w-5 h-5 text-slate-500" />,
    switch: <Activity className="w-5 h-5 text-emerald-500" />,
};

function timeAgo(dateString: string) {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
        return dateString;
    }
}

export function Devices() {
    const navigate = useNavigate();
    const { devices, sites, addDevice, updateDevice, deleteDevice } = useDevicesSites();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState('all');
    const [siteFilter, setSiteFilter] = useState(searchParams.get('site') || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

    // Form State — siteId is set at modal-open time via resetForm, not at mount
    const [formData, setFormData] = useState({
        name: '',
        type: 'camera',
        siteId: '',
        ipAddress: '',
        model: '',
        siteName: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'camera',
            siteId: sites[0]?.id || '',
            ipAddress: '',
            model: '',
            siteName: ''
        });
        setSelectedDevice(null);
    };

    const handleOpenModal = (device?: Device) => {
        if (device) {
            setSelectedDevice(device);
            setFormData({
                name: device.name,
                type: device.type,
                siteId: device.siteId,
                ipAddress: device.ipAddress,
                model: device.model,
                siteName: device.siteName
            });
        } else {
            resetForm();
        }
        setShowAddModal(true);
    };

    const handleSaveDevice = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedSite = sites.find(s => s.id === formData.siteId);
        const siteName = selectedSite?.name || 'Unknown';

        if (selectedDevice) {
            updateDevice(selectedDevice.id, {
                name: formData.name,
                type: formData.type as any,
                siteId: formData.siteId,
                siteName: siteName,
                ipAddress: formData.ipAddress,
                model: formData.model
            });
        } else {
            const device: Device = {
                id: `dev-${crypto.randomUUID()}`,
                name: formData.name,
                siteId: formData.siteId,
                siteName: siteName,
                type: formData.type as any,
                status: 'online',
                health: 'healthy',
                recordingStatus: 'recording',
                lastSeen: new Date().toISOString(),
                ipAddress: formData.ipAddress,
                model: formData.model,
                firmware: '1.0.0'
            };
            addDevice(device);
        }
        setShowAddModal(false);
        resetForm();
    };

    const handleDeleteDevice = (deviceId: string) => {
        setDeleteConfirm({ isOpen: true, id: deviceId });
    };

    const confirmDeleteDevice = () => {
        if (deleteConfirm.id) deleteDevice(deleteConfirm.id);
    };

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
    }, [devices, searchQuery, siteFilter, statusFilter, sortColumn, sortDirection]);

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

    // Status counts for the summary cards — derived from filteredDevices so cards respect filters
    const statusCounts = useMemo(() => {
        const counts = { total: filteredDevices.length, online: 0, offline: 0, warning: 0 };
        filteredDevices.forEach((d) => {
            if (d.status === 'online') counts.online++;
            else if (d.status === 'offline') counts.offline++;
            else counts.warning++;
        });
        return counts;
    }, [filteredDevices]);

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
        {
            key: 'actions',
            header: '',
            align: 'right' as const,
            render: (device: Device) => (
                <div className="flex justify-end gap-2">
                    <PermissionGuard requiredRole={['admin', 'manager']}>
                        <button
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(device);
                            }}
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </PermissionGuard>
                    <PermissionGuard requiredRole={['admin']}>
                        <button
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDevice(device.id);
                            }}
                            title="Delete Device"
                        >
                            <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 dark:text-slate-500 dark:group-hover:text-red-400" />
                        </button>
                    </PermissionGuard>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Devices</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Monitor and manage all connected devices across your sites.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filter
                    </Button>
                    <PermissionGuard requiredRole={['admin', 'manager']}>
                        <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                            Add Device
                        </Button>
                    </PermissionGuard>
                </div>
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
            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Search</label>
                        <SearchInput
                            placeholder="Search devices, IPs, sites..."
                            onSearch={(q) => {
                                setSearchQuery(q);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Site</label>
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
                        </div>
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
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
                </div>
            )}

            {/* Device Table */}
            <Table
                data={paginatedDevices}
                columns={columns}
                keyExtractor={(device) => device.id}
                onRowClick={(device) => navigate(`/devices/${device.id}`)}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                emptyMessage="No devices found matching your criteria"
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredDevices.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </div>
            )}


            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setSelectedDevice(null);
                }}
                title={selectedDevice ? 'Edit Device' : 'Add New Device'}
            >
                <form onSubmit={handleSaveDevice} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Device Name
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Main Entrance Camera"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Type
                        </label>
                        <Select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            options={[
                                { value: 'camera', label: 'Camera' },
                                { value: 'nvr', label: 'NVR' },
                                { value: 'dvr', label: 'DVR' },
                                { value: 'switch', label: 'Switch' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Site
                        </label>
                        <Select
                            value={formData.siteId}
                            onChange={(e) => {
                                const site = sites.find(s => s.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    siteId: e.target.value,
                                    siteName: site?.name || ''
                                });
                            }}
                            options={sites.map(site => ({
                                value: site.id,
                                label: site.name
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            IP Address
                        </label>
                        <Input
                            value={formData.ipAddress}
                            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                            placeholder="e.g., 192.168.1.100"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedDevice(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {selectedDevice ? 'Save Changes' : 'Add Device'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
                onConfirm={confirmDeleteDevice}
                title="Delete Device"
                message="Are you sure you want to delete this device? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
