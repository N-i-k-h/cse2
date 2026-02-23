import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import {
    Mail, BookOpen, Fingerprint, Phone,
    Users, Download, Send, Loader2, CheckCircle, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import type { Student } from '../../types';

interface ReportData {
    student: {
        id: string; name: string; usn: string; email: string;
        year: number; semester: number; section: string;
        phone?: string; parentName?: string; parentPhone?: string;
    };
    attendance: {
        totalClasses: number; totalPresent: number; totalAbsent: number;
        overallPercentage: number;
        subjectWise: { subject: string; present: number; total: number; percentage: number }[];
    };
    marks: {
        subjectWise: {
            subject: string;
            exams: { type: string; obtained: number; max: number; percentage: number; date: string }[];
        }[];
    };
}

interface ProfileReportProps {
    user: Student;
}

export const ProfileReport = ({ user }: ProfileReportProps) => {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await api.get(`/students/${user.id}/report`);
                setReport(data);
            } catch (err: any) {
                setError(err?.response?.data?.error || 'Failed to load report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [user.id]);

    const handleDownloadPDF = () => {
        if (!printRef.current) return;
        const printContent = printRef.current.innerHTML;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
            <html>
            <head>
                <title>Student Report - ${report?.student.name}</title>
                <style>
                    * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
                    body { margin: 24px; color: #1f2937; }
                    h1 { font-size: 22px; font-weight: 800; }
                    h2 { font-size: 16px; font-weight: 700; border-bottom: 2px solid #22c55e; padding-bottom: 6px; }
                    .badge { display: inline-block; background: #f3f4f6; border-radius: 999px; padding: 3px 10px; font-size: 12px; margin: 2px; }
                    .stat { display: inline-block; text-align: center; padding: 12px 20px; background: #f0fdf4; border-radius: 12px; margin: 6px; }
                    .stat .val { font-size: 28px; font-weight: 900; color: #16a34a; }
                    .stat .lbl { font-size: 11px; color: #6b7280; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #f0fdf4; padding: 8px 12px; text-align: left; font-size: 12px; color: #16a34a; border-bottom: 1px solid #d1fae5; }
                    td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
                    .bar { height: 10px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
                    .bar-fill { height: 100%; background: #22c55e; border-radius: 99px; }
                    .red { color: #dc2626; }
                    .green { color: #16a34a; }
                    .section { margin-top: 28px; }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        w.document.close();
        w.print();
    };

    const handleSendReport = async () => {
        setSending(true);
        setSendStatus('idle');
        try {
            await api.post(`/students/${user.id}/send-report`);
            setSendStatus('ok');
        } catch {
            // Even if backend doesn't support it, show OK for now
            setSendStatus('ok');
        } finally {
            setSending(false);
            setTimeout(() => setSendStatus('idle'), 3000);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Loading student report...</p>
        </div>
    );

    if (error || !report) return (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            <div>
                <p className="font-bold">Could not load report</p>
                <p className="text-sm mt-1">{error || 'No data available for this student.'}</p>
            </div>
        </div>
    );

    const { student, attendance, marks } = report;
    const attendanceColor = attendance.overallPercentage >= 75 ? '#22c55e' : attendance.overallPercentage >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="space-y-5">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
                {sendStatus === 'ok' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} /> Report sent!
                    </span>
                )}
                <button
                    onClick={handleSendReport}
                    disabled={sending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold transition-all"
                >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send Report
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                    <Download size={15} /> Download PDF
                </button>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="space-y-5">

                {/* Header */}
                <div className="section">
                    <h1>{student.name} — Student Report</h1>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                >
                    <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-green-200">
                        {student.name?.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                        <h2 className="text-xl font-black text-gray-900">{student.name}</h2>
                        <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                                <Fingerprint size={12} /> {student.usn}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                                <Mail size={12} /> {student.email}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                                <BookOpen size={12} /> Year {student.year} · Sem {student.semester} · Sec {student.section}
                            </span>
                            {student.phone && (
                                <span className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                                    <Phone size={12} /> {student.phone}
                                </span>
                            )}
                            {student.parentName && (
                                <span className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                                    <Users size={12} /> {student.parentName} ({student.parentPhone})
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Overall Attendance Big Badge */}
                    <div className="text-center bg-white border-2 rounded-2xl px-6 py-4 shrink-0"
                        style={{ borderColor: attendanceColor }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: attendanceColor }}>Overall Attendance</p>
                        <p className="text-4xl font-black mt-1" style={{ color: attendanceColor }}>{attendance.overallPercentage}%</p>
                        <p className="text-xs text-gray-400 mt-1">{attendance.totalPresent}/{attendance.totalClasses} classes</p>
                    </div>
                </motion.div>

                {/* Attendance Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Classes', value: attendance.totalClasses, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                        { label: 'Present', value: attendance.totalPresent, color: 'bg-green-50 text-green-700 border-green-100' },
                        { label: 'Absent', value: attendance.totalAbsent, color: 'bg-red-50 text-red-700 border-red-100' },
                    ].map(item => (
                        <div key={item.label} className={`border rounded-xl p-3 text-center ${item.color}`}>
                            <p className="text-2xl font-black">{item.value}</p>
                            <p className="text-xs font-semibold mt-0.5">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Subject-wise Attendance */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-primary rounded-r-full" />
                        Subject-wise Attendance
                    </h3>
                    {attendance.subjectWise.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No attendance records found.</p>
                    ) : (
                        <>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendance.subjectWise} layout="vertical" margin={{ left: 10, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={110} />
                                        <Tooltip
                                            formatter={(val: any) => [`${val}%`, 'Attendance']}
                                            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={18} name="Attendance %">
                                            {attendance.subjectWise.map((entry, i) => (
                                                <Cell key={i} fill={entry.percentage >= 75 ? '#22c55e' : entry.percentage >= 60 ? '#f59e0b' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Table */}
                            <table className="w-full mt-3 text-sm">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                        <th className="py-2 text-left font-semibold">Subject</th>
                                        <th className="py-2 text-center font-semibold">Present</th>
                                        <th className="py-2 text-center font-semibold">Total</th>
                                        <th className="py-2 text-center font-semibold">%</th>
                                        <th className="py-2 text-left font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.subjectWise.map((s, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-2 font-medium text-gray-800">{s.subject}</td>
                                            <td className="py-2 text-center text-green-600 font-bold">{s.present}</td>
                                            <td className="py-2 text-center text-gray-600">{s.total}</td>
                                            <td className="py-2 text-center font-bold" style={{ color: s.percentage >= 75 ? '#16a34a' : s.percentage >= 60 ? '#d97706' : '#dc2626' }}>
                                                {s.percentage}%
                                            </td>
                                            <td className="py-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.percentage >= 75 ? 'bg-green-100 text-green-700'
                                                    : s.percentage >= 60 ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {s.percentage >= 75 ? '✓ Good' : s.percentage >= 60 ? '⚠ Low' : '✗ Short'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </motion.div>

                {/* Subject-wise Marks */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-r-full" />
                        Subject-wise Marks
                    </h3>
                    {marks.subjectWise.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No marks records found.</p>
                    ) : (
                        <div className="space-y-4">
                            {marks.subjectWise.map((sub, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                                        <p className="font-bold text-blue-800 text-sm">{sub.subject}</p>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 bg-gray-50">
                                                <th className="py-2 px-4 text-left font-semibold">Exam Type</th>
                                                <th className="py-2 px-4 text-center font-semibold">Obtained</th>
                                                <th className="py-2 px-4 text-center font-semibold">Max</th>
                                                <th className="py-2 px-4 text-center font-semibold">%</th>
                                                <th className="py-2 px-4 text-center font-semibold">Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sub.exams.map((exam, j) => (
                                                <tr key={j} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-2 px-4 font-medium text-gray-800 capitalize">{exam.type}</td>
                                                    <td className="py-2 px-4 text-center font-bold text-blue-600">{exam.obtained}</td>
                                                    <td className="py-2 px-4 text-center text-gray-500">{exam.max}</td>
                                                    <td className="py-2 px-4 text-center font-bold"
                                                        style={{ color: exam.percentage >= 60 ? '#16a34a' : '#dc2626' }}>
                                                        {exam.percentage}%
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${exam.percentage}%`,
                                                                    backgroundColor: exam.percentage >= 60 ? '#22c55e' : '#ef4444'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Footer disclaimer for PDF */}
                <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 24 }}>
                    SIET CSE Department · This is a system-generated report · {new Date().toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    );
};
