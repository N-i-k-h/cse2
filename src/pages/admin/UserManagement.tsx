import { useState } from 'react';
import { mockUsers } from '../../data/mockData';
import type { User, Role } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { UserForm } from '../../components/admin/UserForm';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleAddUser = (userData: Partial<User>) => {
        const newUser: User = {
            id: `user_${Date.now()}`,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || 'student',
            department: userData.department || 'CSE'
        };
        setUsers([newUser, ...users]);
        setIsModalOpen(false);
    };

    const handleEditUser = (userData: Partial<User>) => {
        if (!editingUser) return;
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const getRoleBadge = (role: Role) => {
        const styles = {
            admin: 'bg-purple-100 text-purple-700',
            hod: 'bg-blue-100 text-blue-700',
            staff: 'bg-green-100 text-green-700',
            student: 'bg-gray-100 text-gray-700'
        };
        return <span className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${styles[role]}`}>{role}</span>
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm">Create and manage access for all roles</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as any)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-gray-600"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="hod">HOD</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.department}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing {filteredUsers.length} of {users.length} users</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded bg-white disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border rounded bg-white disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? "Edit User" : "Add New User"}
            >
                <UserForm
                    initialData={editingUser}
                    onSubmit={editingUser ? handleEditUser : handleAddUser}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
