import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, MapPin } from 'lucide-react';
import type { TimetablePeriod } from '../../types';
import { timetableService } from '../../services/timetableService';
import { facultyService } from '../../services/facultyService';

export const MySchedule = () => {
    const { user } = useAuth();
    const [mySchedule, setMySchedule] = useState<TimetablePeriod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (user?.id) {
                setLoading(true);
                try {
                    // Fetch all faculty, find me.
                    const allFaculty = await facultyService.getAll(); // This returns Staff[]
                    const me = allFaculty.find((f: any) => f.email === user.email);

                    if (me) {
                        const schedule = await timetableService.getByFaculty(me.id);
                        setMySchedule(schedule);
                    }
                } catch (error) {
                    console.error("Failed to fetch schedule", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSchedule();
    }, [user]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Group by day for easier rendering
    const scheduleByDay = days.reduce((acc, day) => {
        acc[day] = mySchedule.filter(t => t.day === day).sort((a, b) => a.period - b.period);
        return acc;
    }, {} as Record<string, TimetablePeriod[]>);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
                <div className="text-sm text-gray-500">
                    {loading ? 'Syncing...' : `Total ${mySchedule.length} Periods`}
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading schedule...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {days.map(day => {
                        const classes = scheduleByDay[day];
                        if (!classes || classes.length === 0) return null;

                        return (
                            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 flex justify-between">
                                    <span>{day}</span>
                                    <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                        {classes.length} Periods
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {classes.map((cls, idx) => (
                                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{cls.subject}</h4>
                                                    {/* @ts-ignore - class name might be mapped */}
                                                    <p className="text-xs text-gray-500 mt-1">{cls.className || 'Class'} - {cls.section || 'A'}</p>
                                                </div>
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                                    Period {cls.period}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>1 Hr</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    <span>{cls.roomId || 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && mySchedule.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400">No classes assigned yet.</p>
                </div>
            )}
        </div>
    );
};
