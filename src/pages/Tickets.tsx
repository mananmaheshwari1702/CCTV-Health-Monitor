import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Filter,
    Plus,
    Search,
    Trash2
} from 'lucide-react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    TicketStatusBadge,
    PriorityBadge,
    Table,
    Pagination,
    Modal,
    ConfirmModal,
    SearchInput
} from '../components/ui';
import { useData } from '../context/DataContext';
import { Ticket as TicketType } from '../types';
import { PermissionGuard } from '../components/auth/PermissionGuard';

const ITEMS_PER_PAGE = 10;

export function Tickets() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { tickets, devices, sites, addTicket, deleteTicket } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

    React.useEffect(() => {
        if (searchParams.get('action') === 'create') {
            setShowCreateModal(true);
        }
    }, [searchParams]);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'medium',
        deviceId: '',
        siteId: ''
    });

    // Set default site when modal opens or sites load
    React.useEffect(() => {
        if (showCreateModal && !newTicket.siteId && sites.length > 0) {
            setNewTicket(prev => ({ ...prev, siteId: sites[0].id }));
        }
    }, [showCreateModal, sites]);

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedDevice = devices.find(d => d.id === newTicket.deviceId);
        if (!selectedDevice) return;

        const ticket: TicketType = {
            id: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: newTicket.title,
            description: newTicket.description,
            priority: newTicket.priority as any,
            status: 'open',
            deviceId: selectedDevice.id,
            deviceName: selectedDevice.name,
            siteName: selectedDevice.siteName,
            assignee: 'Unassigned',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
        };

        addTicket(ticket);
        setShowCreateModal(false);
        setNewTicket({
            title: '',
            description: '',
            priority: 'medium',
            deviceId: '',
            siteId: sites.length > 0 ? sites[0].id : ''
        });
    };

    const handleDeleteTicket = (ticketId: string) => {
        setDeleteConfirm({ isOpen: true, id: ticketId });
    };

    const confirmDelete = () => {
        if (deleteConfirm.id) deleteTicket(deleteConfirm.id);
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesSearch =
                ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tickets, searchTerm, statusFilter, priorityFilter]);

    // Reset page when filters change
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters reduce results
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
    }, [totalPages, currentPage]);

    const columns = [
        {
            key: 'id' as keyof TicketType,
            header: 'Ticket ID',
            render: (ticket: TicketType) => (
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{ticket.id}</span>
            ),
        },
        {
            key: 'title' as keyof TicketType,
            header: 'Title',
            render: (ticket: TicketType) => (
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{ticket.siteName}</p>
                </div>
            ),
        },
        {
            key: 'priority' as keyof TicketType,
            header: 'Priority',
            render: (ticket: TicketType) => <PriorityBadge priority={ticket.priority} />,
        },
        {
            key: 'status' as keyof TicketType,
            header: 'Status',
            render: (ticket: TicketType) => <TicketStatusBadge status={ticket.status} />,
        },
        {
            key: 'assignee' as keyof TicketType,
            header: 'Assignee',
            render: (ticket: TicketType) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        {ticket.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{ticket.assignee}</span>
                </div>
            ),
        },
        {
            key: 'createdAt' as keyof TicketType,
            header: 'Created',
            render: (ticket: TicketType) => (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right' as const,
            render: (ticket: TicketType) => (
                <PermissionGuard requiredRole={['admin', 'manager']}>
                    <button
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTicket(ticket.id);
                        }}
                        title="Delete Ticket"
                    >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 dark:text-slate-500 dark:group-hover:text-red-400" />
                    </button>
                </PermissionGuard>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track and manage maintenance requests and issues.
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
                    <PermissionGuard requiredRole={['admin', 'manager', 'technician']}>
                        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                            Create Ticket
                        </Button>
                    </PermissionGuard>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tickets.length}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">Total Tickets</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                                {tickets.filter((t) => t.status === 'open').length}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">Open</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                                {tickets.filter((t) => t.status === 'in_progress').length}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">In Progress</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                {tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">Resolved</p>
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
                            placeholder="Search tickets..."
                            onSearch={setSearchTerm}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                            <Select
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'open', label: 'Open' },
                                    { value: 'in_progress', label: 'In Progress' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'resolved', label: 'Resolved' },
                                    { value: 'closed', label: 'Closed' },
                                ]}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                            <Select
                                options={[
                                    { value: 'all', label: 'All Priority' },
                                    { value: 'critical', label: 'Critical' },
                                    { value: 'high', label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low', label: 'Low' },
                                ]}
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tickets Table */}
            <Table
                data={paginatedTickets}
                columns={columns}
                keyExtractor={(ticket) => ticket.id}
                onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
                emptyMessage="No tickets found"
            />

            {/* Pagination */}
            {filteredTickets.length > ITEMS_PER_PAGE && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredTickets.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}

            {/* Create Ticket Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Ticket"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => {
                            const form = document.getElementById('create-ticket-form') as HTMLFormElement;
                            form?.requestSubmit();
                        }}>Create Ticket</Button>
                    </div>
                }
            >
                <form id="create-ticket-form" onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Title</label>
                        <Input
                            value={newTicket.title}
                            onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                            placeholder="Brief summary of the issue"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Description</label>
                        <Input
                            value={newTicket.description}
                            onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                            placeholder="Detailed description"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Site</label>
                            <Select
                                value={newTicket.siteId}
                                onChange={e => setNewTicket({ ...newTicket, siteId: e.target.value, deviceId: '' })}
                                options={[
                                    { value: '', label: 'Select Site' },
                                    ...sites.map(s => ({ value: s.id, label: s.name }))
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Device</label>
                            <Select
                                value={newTicket.deviceId}
                                onChange={e => setNewTicket({ ...newTicket, deviceId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select Device' },
                                    ...devices
                                        .filter(d => !newTicket.siteId || d.siteId === newTicket.siteId)
                                        .map(d => ({ value: d.id, label: `${d.name}` }))
                                ]}
                                disabled={!newTicket.siteId}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Priority</label>
                        <Select
                            value={newTicket.priority}
                            onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                            options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                                { value: 'critical', label: 'Critical' },
                            ]}
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
                onConfirm={confirmDelete}
                title="Delete Ticket"
                message="Are you sure you want to delete this ticket? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
