import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Filter,
    MoreVertical,
    Plus,
    Search,
    Ticket,
    CheckCircle,
    Clock,
    AlertTriangle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    Badge,
    Button,
    Input,
    Select,
    TicketStatusBadge,
    PriorityBadge,
    Table,
    SearchInput,
    Modal,
    Textarea
} from '../components/ui';
import { useData } from '../context/DataContext';
import { Ticket as TicketType } from '../types';
import { PermissionGuard } from '../components/auth/PermissionGuard';

export function Tickets() {
    const navigate = useNavigate();
    const { tickets, addTicket, deleteTicket } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'medium',
        device: '',
        site: 'Central Bank HQ'
    });

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();

        const ticket: TicketType = {
            id: `TKT-${Math.floor(Math.random() * 10000)}`,
            title: newTicket.title,
            description: newTicket.description,
            priority: newTicket.priority as any,
            status: 'open',
            deviceId: 'dev-001', // mock
            deviceName: newTicket.device || 'Unknown Device',
            siteName: newTicket.site,
            assignee: 'Unassigned',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
        };

        addTicket(ticket);
        setShowCreateModal(false);
        setNewTicket({ title: '', description: '', priority: 'medium', device: '', site: 'Central Bank HQ' });
    };

    const handleDeleteTicket = (ticketId: string) => {
        if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            deleteTicket(ticketId);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const columns = [
        {
            key: 'id',
            header: 'Ticket ID',
            render: (ticket: TicketType) => (
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{ticket.id}</span>
            ),
        },
        {
            key: 'title',
            header: 'Title',
            render: (ticket: TicketType) => (
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{ticket.siteName}</p>
                </div>
            ),
        },
        {
            key: 'priority',
            header: 'Priority',
            render: (ticket: TicketType) => <PriorityBadge priority={ticket.priority} />,
        },
        {
            key: 'status',
            header: 'Status',
            render: (ticket: TicketType) => <TicketStatusBadge status={ticket.status} />,
        },
        {
            key: 'assignee',
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
            key: 'createdAt',
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
            {/* Filters */}
            <div className="flex items-center gap-4 justify-between flex-wrap">
                <div className="flex-1 min-w-[200px] max-w-md">
                    <SearchInput
                        placeholder="Search tickets..."
                        onSearch={setSearchTerm}
                    />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <Select
                        className="w-auto"
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
                    <Select
                        className="w-auto"
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
                    <PermissionGuard requireManageTickets>
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

            {/* Tickets Table */}
            <Table
                data={filteredTickets}
                columns={columns}
                keyExtractor={(ticket) => ticket.id}
                onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
                emptyMessage="No tickets found"
            />

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Ticket</h2>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-200">Title</label>
                                <Input
                                    value={newTicket.title}
                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                    placeholder="Brief summary of the issue"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-200">Description</label>
                                <Input
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Detailed description"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-200">Device Name</label>
                                    <Input
                                        value={newTicket.device}
                                        onChange={e => setNewTicket({ ...newTicket, device: e.target.value })}
                                        placeholder="e.g. Lobby Cam"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-200">Priority</label>
                                    <select
                                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2 text-sm"
                                        value={newTicket.priority}
                                        onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)} type="button">
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    Create Ticket
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
