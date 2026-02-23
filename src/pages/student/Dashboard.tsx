import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, BookOpen, TrendingUp, CheckCircle, XCircle, AlertCircle, User, MapPin } from 'lucide-react';
import api from '../../services/api';

interface TimetableEntry {
    id: string;
    day_of_week: string;
    period_number: number;
    subject: string;
    faculty_name: string;
    room_number: string;
}

interface StudentReport {
    attendance: {
        totalClasses: number;
        totalPresent: number;
        overallPercentage: number;
        subjectWise: any[];
    };
    marks: {
        subjectWise: any[];
    };
}

export const StudentDashboard = ({ view = 'dashboard' }: { view?: 'dashboard' | 'today' | 'timetable' | 'exams' | 'subjects' }) => {
    useAuth();
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [report, setReport] = useState<StudentReport | null>(null);
    const [studentProfile, setStudentProfile] = useState<any>(null);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile to get studentId and classId
            const profileRes = await api.get('/profile/me');
            const profile = profileRes.data;
            setStudentProfile(profile);

            // 2. Fetch Timetable and Report in parallel
            if (profile.classId && profile.studentId) {
                const [ttRes, reportRes] = await Promise.all([
                    api.get(`/timetable/class/${profile.classId}`),
                    api.get(`/students/${profile.studentId}/report`)
                ]);

                setTimetable(ttRes.data || []);
                setReport(reportRes.data);
            } else {
                console.warn('⚠️ profile is missing classId or studentId', profile);
            }
        } catch (error) {
            console.error('Failed to fetch student dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTodayClasses = () => {
        return timetable.filter(t => t.day_of_week === today).sort((a, b) => a.period_number - b.period_number);
    };

    const getAttendanceColor = (p: number) =>
        p >= 85 ? 'text-green-600 bg-green-50 border-green-200' :
            p >= 75 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-red-600 bg-red-50 border-red-200';

    const getMarksColor = (m: number) =>
        m >= 75 ? 'text-green-600 bg-green-50 border-green-200' :
            m >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-red-600 bg-red-50 border-red-200';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="text-gray-500 font-medium tracking-wide">Syncing your academic records...</div>
            </div>
        );
    }

    // --- VIEW: DASHBOARD (Overview) ---
    if (view === 'dashboard') {
        const todayClasses = getTodayClasses();
        const attendancePct = report?.attendance.overallPercentage || 0;

        // Calculate average mark percentage across all subjects/exams
        let totalPct = 0;
        let examCount = 0;
        report?.marks.subjectWise.forEach(s => {
            s.exams.forEach((e: any) => {
                totalPct += e.percentage;
                examCount++;
            });
        });
        const averageMarks = examCount > 0 ? Math.round(totalPct / examCount) : 0;

        return (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Hub</h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, <span className="font-bold text-primary">{studentProfile?.firstName}</span>!
                        </p>
                    </div>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <div className="px-4 py-2 text-center">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Year</p>
                            <p className="text-sm font-bold text-gray-900">{studentProfile?.year}{studentProfile?.year === 1 ? 'st' : studentProfile?.year === 2 ? 'nd' : studentProfile?.year === 3 ? 'rd' : 'th'}</p>
                        </div>
                        <div className="w-px bg-gray-200 my-2"></div>
                        <div className="px-4 py-2 text-center">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Section</p>
                            <p className="text-sm font-bold text-gray-900">{studentProfile?.section}</p>
                        </div>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-2xl shadow-sm border-2 transition-transform hover:scale-[1.02] ${getAttendanceColor(attendancePct)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Overall Attendance</p>
                                <p className="text-5xl font-black mt-2">{attendancePct}%</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-current opacity-20 rounded-full overflow-hidden">
                                        <div className="h-full bg-current" style={{ width: `${attendancePct}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold">{attendancePct >= 75 ? 'Safe Area' : 'Critical Warning'}</span>
                                </div>
                            </div>
                            <div className="h-20 w-20 bg-white/40 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                                {attendancePct >= 85 ? <CheckCircle size={32} /> :
                                    attendancePct >= 75 ? <AlertCircle size={32} /> :
                                        <XCircle size={32} />}
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl shadow-sm border-2 transition-transform hover:scale-[1.02] ${getMarksColor(averageMarks)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Academic Performance</p>
                                <p className="text-5xl font-black mt-2">{averageMarks}%</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-current opacity-20 rounded-full overflow-hidden">
                                        <div className="h-full bg-current" style={{ width: `${averageMarks}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold">{averageMarks >= 75 ? 'Exceeding' : 'Competent'}</span>
                                </div>
                            </div>
                            <div className="h-20 w-20 bg-white/40 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                                <TrendingUp size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brief Today View */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="text-primary" size={20} />
                            Upcoming Classes
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{today}</span>
                    </div>
                    <div className="p-4">
                        {todayClasses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {todayClasses.slice(0, 4).map((c, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                            {c.period_number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{c.subject}</p>
                                            <p className="text-xs text-gray-500 font-medium truncate">{c.faculty_name} • Rm {c.room_number}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Calendar size={40} className="mx-auto text-gray-200 mb-2" />
                                <p className="text-gray-400 font-bold">No classes scheduled today</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: SUBJECTS ---
    if (view === 'subjects') {
        const subjects = report?.attendance.subjectWise || [];
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <header>
                    <h1 className="text-2xl font-black text-gray-900">My Subjects</h1>
                    <p className="text-gray-500">Academic curriculum and attendance tracking</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.length > 0 ? subjects.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <BookOpen size={24} />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.percentage >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {s.percentage}%
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{s.subject}</h3>
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-4">
                                <User size={14} className="text-primary" /> {s.faculty}
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Attendance</span>
                                    <span>{s.present}/{s.total} Sessions</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className={`h-full transition-all duration-1000 ${s.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ width: `${s.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <BookOpen size={48} className="mx-auto text-gray-100 mb-4" />
                            <h3 className="text-lg font-bold text-gray-400">Curriculum Pending</h3>
                            <p className="text-gray-400 mt-1">Once attendance is marked, your subjects will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: TODAY'S CLASS ---
    if (view === 'today') {
        const todayClasses = getTodayClasses();
        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <header className="px-1">
                    <h1 className="text-2xl font-black text-gray-900">Today's Schedule</h1>
                    <p className="text-gray-500 text-sm">{today}, Academic Year {studentProfile?.year}</p>
                </header>

                <div className="relative px-1">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 hidden md:block"></div>

                    <div className="space-y-4">
                        {todayClasses.length > 0 ? todayClasses.map((c, i) => (
                            <div key={i} className="relative flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                                {/* Timeline Dot (Desktop only) */}
                                <div className="hidden md:flex absolute left-4 h-5 w-5 rounded-full border-4 border-white bg-primary z-10 shadow-sm shadow-primary/20"></div>

                                <div className="md:ml-12 w-full bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                        <div className="text-center min-w-[50px] sm:min-w-[60px] bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</p>
                                            <p className="text-2xl sm:text-3xl font-black text-primary">{c.period_number}</p>
                                        </div>
                                        <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{c.subject}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                                                <User size={14} className="text-primary/60" /> {c.faculty_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                        <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                            <MapPin size={12} /> Room {c.room_number}
                                        </span>
                                        <span className="sm:hidden text-[10px] font-black text-gray-300 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                                <Calendar size={64} className="mx-auto text-gray-100 mb-4" />
                                <h2 className="text-xl font-bold text-gray-400">No Classes Scheduled</h2>
                                <p className="text-gray-400 mt-1">Take a deep breath and enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: WEEKLY TIMETABLE ---
    if (view === 'timetable') {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                <header className="px-1">
                    <h1 className="text-2xl font-black text-gray-900">Weekly Timetable</h1>
                    <p className="text-gray-500 text-sm">Full layout for Section {studentProfile?.section}</p>
                </header>

                {/* Mobile View: Dynamic Accordion/Card stack */}
                <div className="lg:hidden space-y-4 px-1">
                    {days.map(d => {
                        const dayClasses = timetable.filter(t => t.day_of_week === d).sort((a, b) => a.period_number - b.period_number);
                        return (
                            <div key={d} className={`rounded-2xl border overflow-hidden transition-all ${d === today ? 'border-primary shadow-md shadow-primary/5' : 'border-gray-100 bg-white'}`}>
                                <div className={`px-4 py-3 flex justify-between items-center ${d === today ? 'bg-primary text-white' : 'bg-gray-50 text-gray-900'}`}>
                                    <span className="font-bold">{d}</span>
                                    {d === today && <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Today</span>}
                                </div>
                                <div className="p-3 space-y-2">
                                    {dayClasses.length > 0 ? dayClasses.map((c, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{c.period_number}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{c.subject}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate">{c.faculty_name}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">Rm {c.room_number}</span>
                                        </div>
                                    )) : (
                                        <p className="text-center py-4 text-xs font-bold text-gray-300 italic">No classes scheduled</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View: Grid Table (hidden on mobile) */}
                <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest w-32">Day</th>
                                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                                        <th key={p} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">P{p}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {days.map(d => {
                                    const dayClasses = timetable.filter(t => t.day_of_week === d);
                                    return (
                                        <tr key={d} className={d === today ? 'bg-primary/5' : ''}>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${d === today ? 'text-primary' : 'text-gray-900'}`}>{d}</span>
                                                {d === today && <span className="block text-[10px] uppercase font-black text-primary tracking-tighter">Current Day</span>}
                                            </td>
                                            {[1, 2, 3, 4, 5, 6, 7].map(p => {
                                                const c = dayClasses.find(x => x.period_number === p);
                                                return (
                                                    <td key={p} className="px-2 py-4">
                                                        {c ? (
                                                            <div className="bg-white border border-gray-100 p-2 rounded-lg text-center shadow-sm min-w-[100px] hover:border-primary/50 transition-colors">
                                                                <p className="text-xs font-bold text-gray-900 truncate">{c.subject}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium truncate mt-1">{c.faculty_name.split(' ')[0]}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 rounded-lg bg-gray-50/50 border border-dashed border-gray-100"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: EXAMS & MARKS ---
    if (view === 'exams') {
        const marks = report?.marks.subjectWise || [];
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <header>
                    <h1 className="text-2xl font-black text-gray-900">Academic Records</h1>
                    <p className="text-gray-500">Continuous Assessment & Midterm Results</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {marks.length > 0 ? marks.map((s, i) => (
                        <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <BookOpen className="text-primary" size={24} />
                                    {s.subject}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4 flex-1">
                                {s.exams.map((e: any, j: number) => (
                                    <div key={j} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm shadow-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{e.type}</span>
                                            <span className="text-sm font-bold text-gray-700 mt-1">Score Result</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-end gap-1">
                                                <span className={`text-3xl font-black ${e.percentage >= 75 ? 'text-green-500' : e.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {e.obtained}
                                                </span>
                                                <span className="text-sm font-bold text-gray-300 mb-1">/ {e.max}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 mt-1">{e.percentage}% Aggregate</p>
                                        </div>
                                    </div>
                                ))}
                                {s.exams.length === 0 && (
                                    <p className="text-center py-4 text-gray-400 text-sm font-medium italic italic">No marks recorded for this subject yet.</p>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <TrendingUp size={48} className="mx-auto text-gray-100 mb-2" />
                            <p className="text-gray-400 font-bold">No academic records found</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};
