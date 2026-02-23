import { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert, X, Check, Database, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const PURGE_TARGETS = [
    {
        key: 'students',
        label: 'All Students',
        desc: 'Deletes every student account, login credentials and record.',
        color: 'blue',
    },
    {
        key: 'faculty',
        label: 'All Faculty / HOD',
        desc: 'Deletes every faculty and HOD account and their records.',
        color: 'purple',
    },
    {
        key: 'classes',
        label: 'All Classes',
        desc: 'Removes all class setups (year, section, semester).',
        color: 'orange',
    },
    {
        key: 'exams',
        label: 'All Exams & Grades',
        desc: 'Clears all exam definitions and student exam grades.',
        color: 'pink',
    },
    {
        key: 'timetable',
        label: 'Timetable',
        desc: 'Deletes all timetable slots and schedules.',
        color: 'indigo',
    },
    {
        key: 'attendance',
        label: 'Attendance Records',
        desc: 'Wipes all attendance data for all students.',
        color: 'yellow',
    },
    {
        key: 'marks',
        label: 'Internal Marks',
        desc: 'Deletes all internal/continuous assessment marks.',
        color: 'teal',
    },
];

const NUCLEAR = {
    key: 'all',
    label: 'Purge Everything',
    desc: 'Permanently deletes ALL data. Your Super Admin account will be preserved.',
    color: 'red',
    isNuclear: true,
};

type ColorKey = 'blue' | 'purple' | 'orange' | 'pink' | 'indigo' | 'yellow' | 'teal' | 'red';

const palette: Record<ColorKey, { bg: string; border: string; iconBg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', text: 'text-purple-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', text: 'text-orange-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', iconBg: 'bg-pink-100', text: 'text-pink-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', text: 'text-indigo-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', text: 'text-yellow-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', iconBg: 'bg-teal-100', text: 'text-teal-700' },
    red: { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', text: 'text-red-700' },
};

type PurgeTarget = typeof PURGE_TARGETS[0];

interface ConfirmModalProps {
    target: PurgeTarget | typeof NUCLEAR | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
    result: string;
}

const ConfirmModal = ({ target, onConfirm, onCancel, loading, result }: ConfirmModalProps) => {
    const [typed, setTyped] = useState('');
    if (!target) return null;
    const c = palette[(target.color as ColorKey)] || palette.red;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
            >
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${c.iconBg}`}>
                        <ShieldAlert size={22} className={c.text} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-gray-900">Confirm Permanent Deletion</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{target.desc}</p>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 mt-0.5">
                        <X size={18} />
                    </button>
                </div>

                {result ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                        ✅ {result}
                    </div>
                ) : (
                    <>
                        <div className={`p-4 rounded-xl ${c.bg} border ${c.border}`}>
                            <p className="text-sm text-gray-700">
                                You are about to delete: <strong className={c.text}>{target.label}</strong>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">This action <strong>cannot be undone</strong>.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type <strong className="text-red-600">DELETE</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={typed}
                                onChange={e => setTyped(e.target.value)}
                                autoFocus
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 tracking-widest font-mono"
                                placeholder="DELETE"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={typed !== 'DELETE' || loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><RefreshCw size={14} className="animate-spin" /> Deleting…</>
                                    : <><Trash2 size={14} /> Confirm Delete</>
                                }
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export const DatabaseManagement = () => {
    const [pendingTarget, setPendingTarget] = useState<PurgeTarget | typeof NUCLEAR | null>(null);
    const [purging, setPurging] = useState(false);
    const [result, setResult] = useState('');
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const handlePurge = async () => {
        if (!pendingTarget) return;
        setPurging(true);
        setResult('');
        try {
            const resp = await api.post(`/admin/purge/${pendingTarget.key}`);
            const msg = resp.data.message || 'Deleted successfully.';
            setResult(msg);
            showToast('✅ ' + msg, true);
            setTimeout(() => {
                setPendingTarget(null);
                setResult('');
            }, 2000);
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Server error';
            showToast('❌ Failed: ' + msg, false);
        } finally {
            setPurging(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {pendingTarget && (
                    <ConfirmModal
                        target={pendingTarget}
                        onConfirm={handlePurge}
                        onCancel={() => { setPendingTarget(null); setResult(''); }}
                        loading={purging}
                        result={result}
                    />
                )}
            </AnimatePresence>

            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 transition-all
                    ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.ok ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="space-y-8 max-w-5xl">
                <header>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-gray-100 rounded-xl">
                            <Database size={22} className="text-gray-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
                    </div>
                    <p className="text-gray-500 ml-12">Clear data by category. Use this before re-entering fresh data.</p>
                </header>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                        <strong>Warning:</strong> All deletions are permanent and cannot be undone. You must type <strong>DELETE</strong> in the confirmation dialog to proceed. Your Super Admin account is always preserved.
                    </p>
                </div>

                {/* Individual Targets */}
                <div>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Delete by Category</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PURGE_TARGETS.map((t, i) => {
                            const c = palette[(t.color as ColorKey)];
                            return (
                                <motion.div
                                    key={t.key}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex flex-col gap-4`}
                                >
                                    <div>
                                        <p className={`text-sm font-bold ${c.text}`}>{t.label}</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPendingTarget(t)}
                                        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-semibold"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Nuclear Option */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border-2 border-red-300 bg-red-50 p-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-red-700">⚠ Purge Everything</p>
                                <p className="text-sm text-red-500 mt-0.5">{NUCLEAR.desc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPendingTarget(NUCLEAR)}
                            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-md shadow-red-200"
                        >
                            <Trash2 size={16} />
                            Purge All Data
                        </button>
                    </div>
                </motion.div>
            </div>
        </>
    );
};
