import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, User, Clock, Calendar, BookOpen, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { studentService } from '../../services/studentService';
import { facultyService } from '../../services/facultyService';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import api from '../../services/api';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentAttendance {
    id: string;
    name: string;
    usn: string;
    email: string;
    status: AttendanceStatus;
}

interface TimetableEntry {
    id: string;
    subject: string;
    className: string;
    classId: string;
    day: string;
    period: number;
    roomNumber: string;
    year: number;
    semester: number;
    section: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Attendance = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!user?.email) return;
            try {
                const allFaculty = await facultyService.getAll();
                const faculty = allFaculty.find((f: any) => f.email === user.email);
                if (!faculty) { setLoading(false); return; }

                const allTimetable = await timetableService.getAll();
                const facultyTimetable = allTimetable.filter((t: any) => t.facultyId === faculty.id);
                const allClasses = await classService.getAll();

                const timetableWithDetails: TimetableEntry[] = facultyTimetable.map((tt: any) => {
                    const classInfo = allClasses.find((c: any) => c.id === tt.classId);
                    return {
                        id: tt.id, subject: tt.subject,
                        className: classInfo?.name || 'Unknown',
                        classId: tt.classId, day: tt.day, period: tt.period,
                        roomNumber: tt.roomNumber || 'N/A',
                        year: classInfo?.year || 0, semester: classInfo?.semester || 0,
                        section: classInfo?.section || ''
                    };
                });

                timetableWithDetails.sort((a, b) => {
                    const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
                    return dayDiff !== 0 ? dayDiff : a.period - b.period;
                });
                setTimetable(timetableWithDetails);
            } catch (error) {
                console.error('Failed to fetch timetable:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [user]);

    const handleAddAttendance = async (entry: TimetableEntry) => {
        setSelectedEntry(entry);
        setLoading(true);
        setShowAttendanceModal(true);
        try {
            const allStudents = await studentService.getAll();
            let classStudents = allStudents.filter((s: any) => s.classId === entry.classId);
            if (classStudents.length === 0) {
                classStudents = allStudents.filter((s: any) =>
                    s.year === entry.year && s.semester === entry.semester && s.section === entry.section
                );
            }
            setStudents(classStudents.map((s: any) => ({
                id: s.id, name: s.name || `${s.firstName} ${s.lastName}`,
                usn: s.usn, email: s.email, status: 'present' as AttendanceStatus
            })));
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const setStudentStatus = (studentId: string, status: AttendanceStatus) =>
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));

    const markAll = (status: AttendanceStatus) =>
        setStudents(prev => prev.map(s => ({ ...s, status })));

    const saveAttendance = async () => {
        if (!selectedEntry) return;
        setSaving(true);
        try {
            const attendanceRecords = students.map(student => ({
                student_id: student.id, date: attendanceDate, status: student.status,
                class_id: selectedEntry.classId, timetable_id: selectedEntry.id
            }));

            const response = await api.post('/attendance/mark-bulk', { attendance_records: attendanceRecords });
            const results = response.data.results;
            const absentLate = students.filter(s => s.status === 'absent' || s.status === 'late').length;

            alert(`✅ Attendance saved for ${selectedEntry.subject}!\n\n${results.success} students marked\n📧 Emails queued for ${absentLate} absent/late students`);
            setShowAttendanceModal(false);
            setSelectedEntry(null);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;
    const lateCount = students.filter(s => s.status === 'late').length;

    if (loading && timetable.length === 0) {
        return <div className="flex items-center justify-center h-64 text-gray-500">Loading your timetable...</div>;
    }
    if (timetable.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500 mb-2">No timetable entries found.</p>
                    <p className="text-sm text-gray-400">Please contact the administrator.</p>
                </div>
            </div>
        );
    }

    const timetableByDay = DAYS.reduce((acc, day) => {
        acc[day] = timetable.filter(t => t.day === day);
        return acc;
    }, {} as Record<string, TimetableEntry[]>);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Timetable &amp; Attendance</h1>
                    <p className="text-gray-500 text-sm">View your schedule and mark attendance</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500 shrink-0" />
                    <input
                        type="date"
                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Timetable by Day */}
            <div className="space-y-3 sm:space-y-4">
                {DAYS.map(day => {
                    const dayEntries = timetableByDay[day];
                    if (!dayEntries || dayEntries.length === 0) return null;
                    return (
                        <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2.5 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{day}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {dayEntries.map(entry => (
                                    <div key={entry.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                                <div className="bg-primary/10 text-primary px-2 sm:px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm shrink-0">
                                                    P{entry.period}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen size={15} className="text-gray-500 shrink-0" />
                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{entry.subject}</h4>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />{entry.className}
                                                        </span>
                                                        <span className="hidden sm:inline">Rm: {entry.roomNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddAttendance(entry)}
                                                className="bg-primary text-white px-3 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-green-600 transition-all shadow-md shrink-0"
                                            >
                                                <span className="hidden sm:inline">Add </span>Attendance
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Attendance Modal - Full screen on mobile, centered modal on desktop */}
            {showAttendanceModal && selectedEntry && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{selectedEntry.subject}</h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                                        {selectedEntry.className} • {selectedEntry.day} • P{selectedEntry.period} • {new Date(attendanceDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setShowAttendanceModal(false); setSelectedEntry(null); }}
                                    className="ml-3 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full text-xl font-bold shrink-0"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2 p-3 sm:p-4 bg-gray-50 border-b border-gray-200 shrink-0">
                            {[
                                { label: 'Total', value: students.length, cls: 'bg-blue-50 border-blue-200 text-blue-900', lbl: 'text-blue-600' },
                                { label: 'Present', value: presentCount, cls: 'bg-green-50 border-green-200 text-green-900', lbl: 'text-green-600' },
                                { label: 'Late', value: lateCount, cls: 'bg-amber-50 border-amber-200 text-amber-900', lbl: 'text-amber-600' },
                                { label: 'Absent', value: absentCount, cls: 'bg-red-50 border-red-200 text-red-900', lbl: 'text-red-600' },
                            ].map(({ label, value, cls, lbl }) => (
                                <div key={label} className={`${cls} p-2 sm:p-3 rounded-lg border`}>
                                    <p className={`text-xs ${lbl} font-medium`}>{label}</p>
                                    <p className="text-lg sm:text-xl font-bold">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <span className="text-xs sm:text-sm text-gray-600">Quick:</span>
                            <div className="flex gap-1.5 sm:gap-2">
                                <button onClick={() => markAll('present')} className="text-xs font-medium px-2.5 sm:px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">All Present</button>
                                <button onClick={() => markAll('late')} className="text-xs font-medium px-2.5 sm:px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">All Late</button>
                                <button onClick={() => markAll('absent')} className="text-xs font-medium px-2.5 sm:px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">All Absent</button>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading students...</div>
                            ) : students.length > 0 ? (
                                students.map((student, index) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50">
                                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                            <span className="text-xs text-gray-400 font-mono w-6 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                <User size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.usn}</p>
                                            </div>
                                        </div>

                                        {/* Status buttons — compact on mobile */}
                                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                                            {(['present', 'late', 'absent'] as AttendanceStatus[]).map(status => {
                                                const cfg = {
                                                    present: { icon: <Check size={14} />, label: 'P', active: 'bg-green-100 text-green-700 border-green-500', inactive: 'bg-white text-gray-400 border-gray-200' },
                                                    late: { icon: <Clock size={14} />, label: 'L', active: 'bg-amber-100 text-amber-700 border-amber-500', inactive: 'bg-white text-gray-400 border-gray-200' },
                                                    absent: { icon: <X size={14} />, label: 'A', active: 'bg-red-100 text-red-700 border-red-500', inactive: 'bg-white text-gray-400 border-gray-200' },
                                                }[status];
                                                const isActive = student.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => setStudentStatus(student.id, status)}
                                                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg font-medium transition-all border-2 text-xs ${isActive ? cfg.active : cfg.inactive}`}
                                                    >
                                                        {cfg.icon}
                                                        <span className="hidden sm:inline capitalize">{status}</span>
                                                        <span className="sm:hidden font-bold">{cfg.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-400">No students found in this class</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-500">📧 Emails auto-sent for absent &amp; late</span>
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                <button
                                    onClick={() => { setShowAttendanceModal(false); setSelectedEntry(null); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveAttendance}
                                    disabled={saving || students.length === 0}
                                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition-all disabled:opacity-50 text-sm"
                                >
                                    {saving ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
