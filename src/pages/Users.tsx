import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import {
    Card, CardHeader, CardBody, Table, Button, SearchInput,
    Modal, Input, Select, Badge, RoleBadge
} from '../components/ui';
import { useData } from '../context/DataContext';
import type { User as UserType, UserRole, UserStatus } from '../types';
import { PermissionGuard } from '../components/auth/PermissionGuard';

export function Users() {
    const { users, addUser, updateUser, deleteUser } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'viewer' as UserRole,
        status: 'active' as UserStatus
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'viewer',
            status: 'active'
        });
        setSelectedUser(null);
    };

    const handleOpenModal = (user?: UserType) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            resetForm();
        }
        setShowAddModal(true);
    };

    const handleSubmit = () => {
        if (selectedUser) {
            updateUser(selectedUser.id, formData);
        } else {
            const newUser: UserType = {
                id: `user-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                avatar: formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                lastLogin: new Date().toISOString(),
                sites: [] // Default to no sites for refined prototype
            };
            addUser(newUser);
        }
        setShowAddModal(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUser(id);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            key: 'name', header: 'User',
            render: (user: UserType) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center font-semibold">
                        {user.avatar || <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{user.email}</p>
                    </div>
                </div>
            ),
        },
        { key: 'role', header: 'Role', render: (user: UserType) => <RoleBadge role={user.role} /> },
        {
            key: 'status', header: 'Status',
            render: (user: UserType) => <Badge variant={user.status === 'active' ? 'success' : 'neutral'} dot>{user.status}</Badge>,
        },
        { key: 'sites', header: 'Sites', render: (user: UserType) => <span className="text-sm text-slate-600 dark:text-slate-300">{user.sites.length} sites</span> },
        { key: 'lastLogin', header: 'Last Login', render: (user: UserType) => <span className="text-sm text-slate-500 dark:text-slate-300">{new Date(user.lastLogin).toLocaleDateString()}</span> },
        {
            key: 'actions', header: '', align: 'right' as const,
            render: (user: UserType) => (
                <div className="flex justify-end gap-1">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenModal(user); }}>
                        <Edit className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    </button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}>
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600 dark:text-red-400" />
                    </button>
                </div>
            ),
        },
    ];

    const rolePermissions = [
        { role: 'Admin', desc: 'Full access', perms: ['All'] },
        { role: 'Manager', desc: 'Manage teams', perms: ['View', 'Edit', 'Tickets'] },
        { role: 'Technician', desc: 'Maintenance', perms: ['View', 'Edit Devices'] },
        { role: 'Viewer', desc: 'Read-only', perms: ['View'] },
    ];

    return (
        <PermissionGuard
            requiredRole="admin"
            fallback={
                <div className="flex flex-col items-center justify-center h-96">
                    <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">You do not have permission to view this page.</p>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 justify-between flex-wrap">
                    <div className="flex-1 min-w-[200px] max-w-md"><SearchInput placeholder="Search users..." onSearch={setSearchQuery} /></div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Select className="w-auto" options={[{ value: 'all', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Manager' }, { value: 'technician', label: 'Technician' }, { value: 'viewer', label: 'Viewer' }]} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
                        <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>Add User</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card padding="sm"><CardBody><div className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p><p className="text-sm text-slate-500 dark:text-slate-300">Total Users</p></div></CardBody></Card>
                    <Card padding="sm"><CardBody><div className="text-center"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{users.filter(u => u.status === 'active').length}</p><p className="text-sm text-slate-500 dark:text-slate-300">Active</p></div></CardBody></Card>
                    <Card padding="sm"><CardBody><div className="text-center"><p className="text-2xl font-bold text-red-600 dark:text-red-500">{users.filter(u => u.role === 'admin').length}</p><p className="text-sm text-slate-500 dark:text-slate-300">Admins</p></div></CardBody></Card>
                    <Card padding="sm"><CardBody><div className="text-center"><p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{users.filter(u => u.role === 'technician').length}</p><p className="text-sm text-slate-500 dark:text-slate-300">Technicians</p></div></CardBody></Card>
                </div>

                <Table data={filteredUsers} columns={columns} keyExtractor={(user) => user.id} emptyMessage="No users found" />

                <Card>
                    <CardHeader action={<Button variant="ghost" size="sm" icon={<Shield className="w-4 h-4" />}>Manage Roles</Button>}>Roles & Permissions</CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {rolePermissions.map((r) => (
                                <div key={r.role} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{r.role}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{r.desc}</p>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {r.perms.map((p) => <span key={p} className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">{p}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedUser ? 'Edit User' : 'Add User'} size="md"
                    footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleSubmit}>{selectedUser ? 'Save' : 'Add'}</Button></div>}>
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Select
                            label="Role"
                            options={[{ value: 'admin', label: 'Admin' }, { value: 'manager', label: 'Manager' }, { value: 'technician', label: 'Technician' }, { value: 'viewer', label: 'Viewer' }]}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        />
                        <Select
                            label="Status"
                            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                        />
                    </div>
                </Modal>
            </div>
        </PermissionGuard>
    );
}
