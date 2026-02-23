import { useState } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import type { User, Student, Staff } from '../../types';

interface UserTableProps {
    users: (User | Student | Staff)[];
    role: 'student' | 'staff' | 'hod';
    onViewProfile: (user: User) => void;
}

export const UserTable = ({ users, role, onViewProfile }: UserTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-ignore
        (user.usn && user.usn.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header / Controls */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${role}s...`}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="p-4">Name / Email</th>
                            <th className="p-4">Role Info</th>
                            {role === 'student' && <th className="p-4">Academic</th>}
                            <th className="p-4">Details</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {role === 'staff' || role === 'hod' ? (
                                        <div className="space-y-1">
                                            {/* @ts-ignore */}
                                            <span className="block text-sm font-medium">{user.designation || 'Staff'}</span>
                                            {/* @ts-ignore */}
                                            <span className="text-xs text-gray-500">ID: {user.id}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {/* @ts-ignore */}
                                            <span className="block text-sm font-medium text-gray-900">{user.usn || 'N/A'}</span>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">ACTIVE</span>
                                        </div>
                                    )}
                                </td>
                                {role === 'student' && (
                                    <td className="p-4">
                                        {/* @ts-ignore */}
                                        <div className="text-sm">Sem {user.semester} • Sec {user.section}</div>
                                        {/* @ts-ignore */}
                                        <div className="text-xs text-gray-500">{user.year} Year</div>
                                    </td>
                                )}
                                <td className="p-4">
                                    {role === 'staff' ? (
                                        // @ts-ignore
                                        <div className="text-xs text-gray-500 max-w-[150px] truncate" title={user.subjects?.join(', ')}>
                                            {/* @ts-ignore */}
                                            {user.subjects?.join(', ') || 'No subjects'}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">{user.department}</div>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => onViewProfile(user)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-600 rounded-lg text-sm font-medium transition-all shadow-sm"
                                    >
                                        <Eye size={16} />
                                        View Profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No {role}s found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
