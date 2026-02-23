import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { studentService } from '../../services/studentService';
import { facultyService } from '../../services/facultyService';
import { classService } from '../../services/classService';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        classCount: 0,
        yearCounts: { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>
    });

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [students, faculty, classes] = await Promise.all([
                studentService.getAll(),
                facultyService.getAll(),
                classService.getAll()
            ]);
            const newYearCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
            students.forEach((s: any) => {
                const year = s.year || 0;
                if (year >= 1 && year <= 4) newYearCounts[year]++;
            });
            setStats({
                totalStudents: students.length,
                totalFaculty: faculty.length,
                classCount: classes.length,
                yearCounts: newYearCounts
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const donutData = [
        { name: '1st Year', value: stats.yearCounts[1], color: '#86EFAC' },
        { name: '2nd Year', value: stats.yearCounts[2], color: '#4ADE80' },
        { name: '3rd Year', value: stats.yearCounts[3], color: '#22C55E' },
        { name: '4th Year', value: stats.yearCounts[4], color: '#16A34A' },
    ];

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading dashboard analytics...</div>;
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <header>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">SIET CSE Department Overview</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} color="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Total Faculty" value={stats.totalFaculty} icon={Users} color="text-green-600" bg="bg-green-50" />
                <StatCard label="Active Classes" value={stats.classCount} icon={BookOpen} color="text-orange-600" bg="bg-orange-50" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                        <Layers size={20} className="text-primary" /> Student Distribution
                    </h3>
                    <div className="h-[240px] sm:h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-full">
                        <BookOpen size={32} className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">System Monitoring</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
                            Advanced analytics will appear here once sufficient data is collected.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="text-primary hover:text-green-700 font-semibold text-sm"
                    >
                        Manage Students &amp; Attendance &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 ${bg} ${color} rounded-xl`}>
                <Icon size={22} />
            </div>
        </div>
    </div>
);
