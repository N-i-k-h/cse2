import React, { useState } from 'react';
import type { User } from '../../types';
import { Save, ShieldAlert } from 'lucide-react';

interface UserFormProps {
    initialData?: User | null;
    onSubmit: (data: Partial<User>) => void;
    onCancel: () => void;
}

export const UserForm = ({ initialData, onSubmit, onCancel }: UserFormProps) => {
    const [formData, setFormData] = useState<Partial<User>>(
        initialData || {
            name: '',
            email: '',
            role: 'student',
            department: 'CSE',
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const cseEmailRegex = /^[a-zA-Z0-9._%+-]+@cse$/;

        if (!formData.email || !cseEmailRegex.test(formData.email)) {
            newErrors.email = 'Email must end with @cse';
        }

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[name];
                return newErr;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.name ? 'border-red-500 ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
                    placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.email ? 'border-red-500 ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
                        placeholder="username@cse"
                    />
                    {errors.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                            <ShieldAlert size={16} />
                        </div>
                    )}
                </div>
                {errors.email ? (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                ) : (
                    <p className="text-xs text-gray-400 mt-1">Must strictly end with @cse domain</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="hod">HOD</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>
            </div>

            {/* Role Specific Fields */}
            {formData.role === 'student' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-4 bg-gray-50/50 p-4 rounded-xl">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">USN (University Serial No.)</label>
                        <input
                            type="text"
                            name="usn"
                            // @ts-ignore
                            value={formData.usn || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
                            placeholder="1SI..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            name="year"
                            // @ts-ignore
                            value={formData.year || 1}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select
                            name="semester"
                            // @ts-ignore
                            value={formData.semester || 1}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <input
                            type="text"
                            name="section"
                            // @ts-ignore
                            value={formData.section || 'A'}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase"
                            maxLength={1}
                        />
                    </div>
                </div>
            )}

            {formData.role === 'staff' && (
                <div className="pt-4 border-t border-gray-50 mt-4 bg-gray-50/50 p-4 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select
                            name="designation"
                            // @ts-ignore
                            value={formData.designation || 'Assistant Professor'}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Lecturer">Lecturer</option>
                        </select>
                    </div>
                    {/* Specialization logic could go here, modeled as 'subjects' for now */}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg shadow-green-100"
                >
                    <Save size={18} />
                    <span>Save User</span>
                </button>
            </div>
        </form>
    );
};
