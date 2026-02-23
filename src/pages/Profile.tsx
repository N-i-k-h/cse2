import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, Shield, Briefcase, GraduationCap } from 'lucide-react';
import api from '../services/api';

export const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        usn: '',
        year: 0,
        semester: 0,
        section: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/me');
            setProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/profile/update', {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone
            });

            alert('✅ Profile updated successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('❌ New passwords do not match!');
            return;
        }

        if (passwords.newPassword.length < 6) {
            alert('❌ Password must be at least 6 characters!');
            return;
        }

        setSaving(true);

        try {
            await api.put('/profile/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            alert('✅ Password changed successfully!');
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordSection(false);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    const getRoleIcon = () => {
        switch (user?.role) {
            case 'admin':
                return <Shield className="text-purple-600" size={24} />;
            case 'hod':
                return <Briefcase className="text-blue-600" size={24} />;
            case 'staff':
                return <Briefcase className="text-green-600" size={24} />;
            case 'student':
                return <GraduationCap className="text-orange-600" size={24} />;
            default:
                return <User className="text-gray-600" size={24} />;
        }
    };

    const getRoleBadgeColor = () => {
        switch (user?.role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700';
            case 'hod':
                return 'bg-blue-100 text-blue-700';
            case 'staff':
                return 'bg-green-100 text-green-700';
            case 'student':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md">
                        {getRoleIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                                {user?.role?.toUpperCase()}
                            </span>
                            {profile.usn && (
                                <span className="text-sm text-gray-600">USN: {profile.usn}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User size={20} />
                        Profile Information
                    </h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Mail size={16} />
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Phone size={16} />
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Faculty-specific fields */}
                        {(user?.role === 'staff' || user?.role === 'hod') && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.department}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.designation}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                            </>
                        )}

                        {/* Student-specific fields */}
                        {user?.role === 'student' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        USN
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.usn}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year / Semester / Section
                                    </label>
                                    <input
                                        type="text"
                                        value={`Year ${profile.year} / Sem ${profile.semester} / Section ${profile.section}`}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lock size={20} />
                        Change Password
                    </h2>
                    {!showPasswordSection && (
                        <button
                            onClick={() => setShowPasswordSection(true)}
                            className="text-sm text-primary hover:text-green-600 font-semibold"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {showPasswordSection && (
                    <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Lock size={18} />
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
