import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ChevronRight, GraduationCap, UserCog, Users, ShieldCheck, IdCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RoleTab = 'student' | 'staff' | 'hod' | 'admin';

const roles: { key: RoleTab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'student', label: 'Student', icon: <GraduationCap size={18} />, color: 'text-blue-600' },
    { key: 'staff', label: 'Faculty', icon: <UserCog size={18} />, color: 'text-purple-600' },
    { key: 'hod', label: 'HOD', icon: <Users size={18} />, color: 'text-orange-500' },
    { key: 'admin', label: 'Super Admin', icon: <ShieldCheck size={18} />, color: 'text-green-600' },
];

export const Login = () => {
    const [activeRole, setActiveRole] = useState<RoleTab>('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const isStudent = activeRole === 'student';
    const isFaculty = activeRole === 'staff' || activeRole === 'hod';
    const isAdmin = activeRole === 'admin';

    const handleRoleChange = (role: RoleTab) => {
        setActiveRole(role);
        setIdentifier('');
        setPassword('');
        setPasswordTouched(false);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Always use typed password
            const pwd = password;

            const success = await login(identifier, pwd, activeRole);
            if (success) {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.role === 'admin') navigate('/admin');
                    else if (user.role === 'hod') navigate('/admin'); // HOD has full admin access
                    else if (user.role === 'student') navigate('/student');
                    else navigate('/staff/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const currentRole = roles.find(r => r.key === activeRole)!;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden font-sans">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-primary to-green-400 px-8 pt-8 pb-6 text-white text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mb-3">
                        <Lock size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">SIET CSE Portal</h1>
                    <p className="text-white/80 text-sm mt-1">Sign in to your account</p>
                </div>

                {/* Role Tabs */}
                <div className="grid grid-cols-4 border-b border-gray-100">
                    {roles.map((role) => (
                        <button
                            key={role.key}
                            type="button"
                            onClick={() => handleRoleChange(role.key)}
                            className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all duration-200 border-b-2
                                ${activeRole === role.key
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={activeRole === role.key ? 'text-primary' : ''}>{role.icon}</span>
                            {role.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeRole}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-sm text-gray-500 mb-5">
                                {isStudent
                                    ? 'Enter your USN to login. Your default password is your USN.'
                                    : isFaculty
                                        ? `Enter your Faculty ID. Your default password is your Faculty ID.`
                                        : `Sign in as ${currentRole.label} with your email and password.`
                                }
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Identifier field: auto-syncs password for non-admin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isStudent ? 'USN (University Seat Number)'
                                            : isFaculty ? 'Faculty ID'
                                                : 'Email Address'}
                                    </label>
                                    <div className="relative">
                                        {isStudent
                                            ? <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            : isFaculty
                                                ? <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        }
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => {
                                                const val = (isStudent || isFaculty)
                                                    ? e.target.value.toUpperCase()
                                                    : e.target.value;
                                                setIdentifier(val);
                                                // Auto-sync password only if user hasn't manually changed it
                                                if (!isAdmin && !passwordTouched) {
                                                    setPassword(val);
                                                }
                                            }}
                                            required
                                            className="pl-10 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                            placeholder={isStudent ? 'e.g. 1SI23CS001' : isFaculty ? 'e.g. SIET001' : 'your@email.com'}
                                        />
                                    </div>
                                </div>

                                {/* Password — always shown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setPasswordTouched(true);
                                            }}
                                            required
                                            className="pl-10 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                            placeholder={isStudent ? 'e.g. 1SI23CS001' : isFaculty ? 'e.g. SIET001' : 'Enter password'}
                                        />
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-green-600 disabled:opacity-60 text-white p-3 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all flex items-center justify-center group mt-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Signing in...</span>
                                    ) : (
                                        <>
                                            <span>Sign In as {currentRole.label}</span>
                                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
