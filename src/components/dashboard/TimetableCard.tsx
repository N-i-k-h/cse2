import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Alias not working
// import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, BookOpen, CalendarDays } from 'lucide-react';
import type { TimetablePeriod } from '../../types';
import { timetableService } from '../../services/timetableService';
import { useAuth } from '../../context/AuthContext';

// Basic UI Components to replace missing ones or we should use relative imports if files exist
// Assuming files don't exist in standard 'ui' folder as per previous 'AdminTimetable' fix which removed them.
// We will create simple HTML equivalents here to ensure stability.

const Card = ({ children, className }: any) => <div className={`bg-white rounded-xl shadow-sm border ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={`font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Badge = ({ children, variant, className }: any) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className} ${variant === 'outline' ? 'border' : ''}`}>
        {children}
    </span>
);

interface TimetableCardProps {
    role: 'student' | 'faculty';
    classId?: string; // For students
    facultyId?: string; // For faculty
}

const TimetableCard: React.FC<TimetableCardProps> = ({ role, classId, facultyId }) => {
    const [schedule, setSchedule] = useState<TimetablePeriod[]>([]);
    const [currentPeriod, setCurrentPeriod] = useState<TimetablePeriod | null>(null);
    const [nextPeriod, setNextPeriod] = useState<TimetablePeriod | null>(null);
    const [loading, setLoading] = useState(true);

    // Time slots mapping (Example specific to SIET CSE)
    // You might want to move this to a config or fetch from backend
    const timeSlots = [
        { period: 1, start: '09:00', end: '10:00' },
        { period: 2, start: '10:00', end: '11:00' },
        { period: 3, start: '11:15', end: '12:15' },
        { period: 4, start: '12:15', end: '13:15' },
        { period: 5, start: '14:00', end: '15:00' },
        { period: 6, start: '15:00', end: '16:00' },
        { period: 7, start: '16:00', end: '17:00' },
    ];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchSchedule();
        // Refresh every 5 minutes to keep "Current Period" updated
        const interval = setInterval(fetchSchedule, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [classId, facultyId]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            let data: TimetablePeriod[] = [];
            if (role === 'student' && classId) {
                data = await timetableService.getByClass(classId);
            } else if (role === 'faculty' && facultyId) {
                data = await timetableService.getByFaculty(facultyId);
            }
            setSchedule(data);
            updateCurrentNext(data);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCurrentNext = (data: TimetablePeriod[]) => {
        const now = new Date();
        const currentDay = days[now.getDay()];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Filter for today
        const todaysClasses = data.filter(p => p.day === currentDay).sort((a, b) => a.period - b.period);

        let current: TimetablePeriod | null = null;
        let next: TimetablePeriod | null = null;

        for (const cls of todaysClasses) {
            const slot = timeSlots.find(s => s.period === cls.period);
            if (!slot) continue;

            const [startH, startM] = slot.start.split(':').map(Number);
            const [endH, endM] = slot.end.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;

            if (currentTime >= startTime && currentTime < endTime) {
                current = cls;
            } else if (currentTime < startTime && !next) {
                next = cls;
            }
        }

        // If no next class found today, maybe show first class of tomorrow? (Optional enhancement)

        setCurrentPeriod(current);
        setNextPeriod(next);
    };

    // Helper to get time string for a period
    const getPeriodTime = (p: number) => {
        const slot = timeSlots.find(s => s.period === p);
        return slot ? `${slot.start} - ${slot.end}` : `Period ${p}`;
    };

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center bg-white rounded-xl shadow-sm border border-emerald-100 animate-pulse">
                <span className="text-emerald-600">Loading schedule...</span>
            </div>
        );
    }

    // If no classes today currently or next
    const noActiveClasses = !currentPeriod && !nextPeriod;

    return (
        <div className="space-y-6">
            {/* Current/Next Class Card - "My Day" */}
            <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-sm overflow-hidden">
                <CardHeader className="pb-2 border-b border-emerald-100/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-emerald-600" />
                            My Day
                        </CardTitle>
                        <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                            {days[new Date().getDay()]}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {currentPeriod ? (
                        <div className="p-4 bg-white rounded-lg border-l-4 border-emerald-500 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                    Now Happening
                                </Badge>
                                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getPeriodTime(currentPeriod.period)}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{currentPeriod.subject}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {currentPeriod.roomId || 'Room TBD'}
                                </div>
                                {role === 'student' && (
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {currentPeriod.facultyName || 'Faculty TBD'}
                                    </div>
                                )}
                                {role === 'faculty' && currentPeriod.className && (
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                        {currentPeriod.className} {currentPeriod.section && `- ${currentPeriod.section}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white/50 rounded-lg border border-dashed border-gray-200 text-center">
                            <p className="text-gray-500 text-sm">No class currently in session.</p>
                        </div>
                    )}

                    {nextPeriod && (
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 opacity-90">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Up Next</span>
                                <span className="text-xs text-emerald-600">{getPeriodTime(nextPeriod.period)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800">{nextPeriod.subject}</span>
                                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                    {nextPeriod.roomId}
                                </span>
                            </div>
                        </div>
                    )}

                    {noActiveClasses && (
                        <p className="text-center text-gray-500 py-2">No more classes scheduled for today! 🎉</p>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default TimetableCard;
