import React, { useState } from 'react';
import {
    Filter,
    Plus,
    Search,
    MoreVertical,
    MessageSquare,
    User,
    Clock,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardBody,
    Table,
    Button,
    SearchInput,
    Modal,
    Input,
    Select,
    Textarea,
    PriorityBadge,
    TicketStatusBadge,
} from '../components/ui';
import { tickets } from '../data/mockData';
import type { Ticket } from '../types';

export function Tickets() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority =
            priorityFilter === 'all' || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const columns = [
        {
            key: 'id',
            header: 'Ticket ID',
            render: (ticket: Ticket) => (
                <span className="font-mono text-sm text-slate-600">{ticket.id}</span>
            ),
        },
        {
            key: 'title',
            header: 'Title',
            render: (ticket: Ticket) => (
                <div>
                    <p className="font-medium text-slate-900">{ticket.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ticket.siteName}</p>
                </div>
            ),
        },
        {
            key: 'priority',
            header: 'Priority',
            render: (ticket: Ticket) => <PriorityBadge priority={ticket.priority} />,
        },
        {
            key: 'status',
            header: 'Status',
            render: (ticket: Ticket) => <TicketStatusBadge status={ticket.status} />,
        },
        {
            key: 'assignee',
            header: 'Assignee',
            render: (ticket: Ticket) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                        {ticket.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-slate-700">{ticket.assignee}</span>
                </div>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (ticket: Ticket) => (
                <span className="text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
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
                        onSearch={setSearchQuery}
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
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                        Create Ticket
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
                            <p className="text-sm text-slate-500">Total Tickets</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {tickets.filter((t) => t.status === 'open').length}
                            </p>
                            <p className="text-sm text-slate-500">Open</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {tickets.filter((t) => t.status === 'in_progress').length}
                            </p>
                            <p className="text-sm text-slate-500">In Progress</p>
                        </div>
                    </CardBody>
                </Card>
                <Card padding="sm">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">
                                {tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
                            </p>
                            <p className="text-sm text-slate-500">Resolved</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tickets Table */}
            <Table
                data={filteredTickets}
                columns={columns}
                keyExtractor={(ticket) => ticket.id}
                onRowClick={(ticket) => setSelectedTicket(ticket)}
                emptyMessage="No tickets found"
            />

            {/* Ticket Detail Sidebar */}
            {selectedTicket && (
                <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-sm font-mono text-slate-500">{selectedTicket.id}</p>
                                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                                    {selectedTicket.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <PriorityBadge priority={selectedTicket.priority} />
                                <TicketStatusBadge status={selectedTicket.status} />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-700">{selectedTicket.description}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">
                                        Assigned to <strong>{selectedTicket.assignee}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">
                                        Created {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            <div className="flex gap-2">
                                <Button variant="primary" fullWidth>
                                    Update Ticket
                                </Button>
                                <Button variant="outline" fullWidth>
                                    Add Comment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Ticket Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Ticket"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setShowCreateModal(false)}>Create Ticket</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input label="Title" placeholder="Brief description of the issue" />
                    <Textarea label="Description" placeholder="Detailed description..." />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Priority"
                            options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                                { value: 'critical', label: 'Critical' },
                            ]}
                        />
                        <Select
                            label="Site"
                            options={[
                                { value: 'site-001', label: 'Downtown Mall' },
                                { value: 'site-002', label: 'Central Bank HQ' },
                                { value: 'site-003', label: 'Airport Terminal B' },
                            ]}
                        />
                    </div>
                    <Select
                        label="Device"
                        options={[
                            { value: 'dev-001', label: 'Entrance Cam 1' },
                            { value: 'dev-002', label: 'Parking Lot NVR' },
                            { value: 'dev-003', label: 'Lobby Cam 2' },
                        ]}
                    />
                    <Select
                        label="Assignee"
                        options={[
                            { value: 'user-001', label: 'John Smith' },
                            { value: 'user-002', label: 'Sarah Johnson' },
                            { value: 'user-003', label: 'Mike Wilson' },
                        ]}
                    />
                </div>
            </Modal>
        </div>
    );
}
