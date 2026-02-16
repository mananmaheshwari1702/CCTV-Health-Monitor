import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    MapPin,
    MoreVertical,
    Plus,
    Search,
    Signal,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Filter,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    Camera
} from 'lucide-react';
import {
    Card,
    CardBody,
    Badge,
    StatusBadge,
    Button,
    Input,
    Select,
    Table,
    Modal,
    ConfirmModal,
    SearchInput
} from '../components/ui';
import { useDevicesSites } from '../context/DataContext';
import type { Site, Device } from '../types';
import { PermissionGuard } from '../components/auth/PermissionGuard';

export function Sites() {
    const navigate = useNavigate();
    const { sites, devices, addSite, updateSite, deleteSite } = useDevicesSites();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        status: 'active'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            city: '',
            status: 'active'
        });
        setSelectedSite(null);
    };

    const handleOpenModal = (site?: Site) => {
        if (site) {
            setSelectedSite(site);
            setFormData({
                name: site.name,
                address: site.address,
                city: site.city,
                status: site.status as string
            });
        } else {
            resetForm();
        }
        setShowAddModal(true);
    };

    const handleSaveSite = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSite) {
            updateSite(selectedSite.id, {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                status: formData.status as any
            });
        } else {
            const site: Site = {
                id: `site-${crypto.randomUUID()}`,
                name: formData.name,
                address: formData.address,
                city: formData.city,
                status: formData.status as any,
                lastSync: new Date().toISOString()
            };
            addSite(site);
        }
        setShowAddModal(false);
        resetForm();
    };

    const handleDeleteSite = (siteId: string) => {
        setDeleteConfirm({ isOpen: true, id: siteId });
    };

    const confirmDeleteSite = () => {
        if (deleteConfirm.id) deleteSite(deleteConfirm.id);
    };

    const toggleExpand = (siteId: string) => {
        setExpandedSiteId(expandedSiteId === siteId ? null : siteId);
    };

    const filteredSites = useMemo(() => {
        let result = [...sites];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.city.toLowerCase().includes(q) ||
                    s.address.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter((s) => s.status === statusFilter);
        }

        return result;
    }, [sites, searchQuery, statusFilter]);

    // Enhanced columns to include device count derived from actual devices list if needed
    // For now using the mock data count, but could filter devices by siteId
    const getSiteDevices = (siteId: string) => devices.filter(d => d.siteId === siteId);

    const columns = [
        {
            key: 'name' as keyof Site,
            header: 'Site Name',
            render: (site: Site) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">{site.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {site.id}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'address' as keyof Site,
            header: 'Location',
            render: (site: Site) => (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{site.address}, {site.city}</span>
                </div>
            ),
        },
        {
            key: 'status' as keyof Site,
            header: 'Status',
            render: (site: Site) => <StatusBadge status={site.status} />,
        },
        {
            key: 'devices' as keyof Site,
            header: 'Devices',
            render: (site: Site) => {
                const siteDevices = getSiteDevices(site.id);
                const deviceCount = siteDevices.length;
                const onlineCount = siteDevices.filter(d => d.status === 'online').length;

                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="neutral">{deviceCount} Devices</Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {onlineCount} Online
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: '',
            align: 'right' as const,
            render: (site: Site) => (
                <div className="flex justify-end gap-2">
                    <button
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(site.id);
                        }}
                    >
                        {expandedSiteId === site.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <PermissionGuard requiredRole={['admin', 'manager']}>
                        <button
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(site);
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
                                handleDeleteSite(site.id);
                            }}
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sites</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your physical locations and their connected devices.
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
                    <PermissionGuard requiredRole={['admin']}>
                        <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                            Add Site
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Search</label>
                        <SearchInput
                            placeholder="Search sites, cities..."
                            onSearch={setSearchQuery}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="w-48">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'maintenance', label: 'Maintenance' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Table<Site>
                data={filteredSites}
                columns={columns}
                keyExtractor={(s) => s.id}
                onRowClick={(s) => toggleExpand(s.id)}
                expandable={(site) => expandedSiteId === site.id && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Connected Devices
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {getSiteDevices(site.id).map(device => (
                                <div key={device.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{device.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{device.ipAddress}</p>
                                    </div>
                                </div>
                            ))}
                            {getSiteDevices(site.id).length === 0 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No devices configured for this site.</p>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="outline" onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/devices?site=${site.id}`);
                            }}>
                                View All Devices
                            </Button>
                        </div>
                    </div>
                )}
                emptyMessage="No sites found matching your criteria"
            />

            {/* Add/Edit Site Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); resetForm(); }}
                title={selectedSite ? 'Edit Site' : 'Add New Site'}
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
                        <Button variant="primary" onClick={() => {
                            const form = document.getElementById('site-form') as HTMLFormElement;
                            form?.requestSubmit();
                        }}>{selectedSite ? 'Save Changes' : 'Add Site'}</Button>
                    </div>
                }
            >
                <form id="site-form" onSubmit={handleSaveSite} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Site Name</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. North Warehouse"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Address</label>
                        <Input
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street Address"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">City</label>
                        <Input
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Status</label>
                        <Select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'maintenance', label: 'Maintenance' }
                            ]}
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
                onConfirm={confirmDeleteSite}
                title="Delete Site"
                message="Are you sure you want to delete this site? All associated device assignments will be affected."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
