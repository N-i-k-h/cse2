import { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertTriangle, TrendingDown, BookOpen } from 'lucide-react';
import { facultyService } from '../../services/facultyService';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { timetableService } from '../../services/timetableService';

interface Faculty {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
}

interface Student {
    id: string;
    name: string;
    usn: string;
    email: string;
    phone: string;
    year: number;
    semester: number;
    section: string;
    classId: string;
    className?: string;
}

interface Class {
    id: string;
    name: string;
    year: number;
    semester: number;
    section: string;
    studentCount?: number;
}

interface LowAttendanceStudent extends Student {
    attendancePercentage: number;
}

interface LowMarksStudent extends Student {
    averageMarks: number;
    examName: string;
}

export const HodDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'students' | 'timetable' | 'alerts'>('overview');
    const [loading, setLoading] = useState(true);

    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [classList, setClassList] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [classStudents, setClassStudents] = useState<Student[]>([]);
    const [timetable, setTimetable] = useState<any[]>([]);
    const [lowAttendanceStudents, setLowAttendanceStudents] = useState<LowAttendanceStudent[]>([]);
    const [lowMarksStudents, setLowMarksStudents] = useState<LowMarksStudent[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch faculty
            const faculty = await facultyService.getAll();
            setFacultyList(faculty);

            // Fetch classes
            const classes = await classService.getAll();
            setClassList(classes);

            // Fetch all students
            const students = await studentService.getAll();

            // Count students per class
            const classesWithCount = classes.map((cls: Class) => ({
                ...cls,
                studentCount: students.filter((s: Student) => s.classId === cls.id).length
            }));
            setClassList(classesWithCount);

            // Fetch timetable
            const tt = await timetableService.getAll();
            setTimetable(tt);

            // Fetch low attendance students
            await fetchLowAttendanceStudents();

            // Fetch low marks students
            await fetchLowMarksStudents();

        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLowAttendanceStudents = async () => {
        // TODO: Implement attendance percentage endpoint
        // For now, set empty array to avoid 404 errors
        setLowAttendanceStudents([]);
    };

    const fetchLowMarksStudents = async () => {
        // TODO: Implement exam grades average endpoint
        // For now, set empty array to avoid 404 errors
        setLowMarksStudents([]);
    };

    const handleClassSelect = async (classId: string) => {
        setSelectedClass(classId);
        try {
            const allStudents = await studentService.getAll();
            const filtered = allStudents.filter((s: Student) => s.classId === classId);
            const studentsWithNames = filtered.map((s: Student) => ({
                ...s,
                name: s.name || s.email || 'Unknown'
            }));
            setClassStudents(studentsWithNames);
        } catch (error) {
            console.error('Failed to fetch class students:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading HOD Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
                <p className="text-gray-600 mt-1">Department Overview & Management</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Faculty</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{facultyList.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Classes</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{classList.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Low Attendance</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">{lowAttendanceStudents.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="text-amber-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Low Marks</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{lowMarksStudents.length}</p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'overview'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('faculty')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'faculty'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Faculty List
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'students'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Class-wise Students
                        </button>
                        <button
                            onClick={() => setActiveTab('timetable')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'timetable'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Timetable
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-6 py-4 font-semibold whitespace-nowrap ${activeTab === 'alerts'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Alerts
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Alerts */}
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="text-amber-600" size={20} />
                                        Recent Alerts
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700">
                                            • {lowAttendanceStudents.length} students with attendance below 85%
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            • {lowMarksStudents.length} students with low marks
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <GraduationCap className="text-blue-600" size={20} />
                                        Department Stats
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700">
                                            • {facultyList.length} faculty members
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            • {classList.length} active classes
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            • {timetable.length} timetable entries
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Faculty List Tab */}
                    {activeTab === 'faculty' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Faculty Members ({facultyList.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {facultyList.map((faculty, index) => (
                                            <tr key={faculty.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{faculty.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{faculty.email}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{faculty.phone}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{faculty.designation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Class-wise Students Tab */}
                    {activeTab === 'students' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Class-wise Students</h3>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => handleClassSelect(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a class</option>
                                    {classList.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.studentCount} students)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedClass && classStudents.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">USN</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {classStudents.map((student, index) => (
                                                <tr key={student.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.usn}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{student.phone}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{student.section}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedClass && classStudents.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No students found in this class
                                </div>
                            )}

                            {!selectedClass && (
                                <div className="text-center py-12 text-gray-500">
                                    Please select a class to view students
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timetable Tab */}
                    {activeTab === 'timetable' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Department Timetable ({timetable.length} entries)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Faculty</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Room</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {timetable.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.day}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{entry.period}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.subject}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{entry.className}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{entry.facultyName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{entry.roomNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            {/* Low Attendance */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-amber-600" size={20} />
                                    Students with Attendance Below 85% ({lowAttendanceStudents.length})
                                </h3>
                                {lowAttendanceStudents.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-amber-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">USN</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attendance %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {lowAttendanceStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.usn}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">Year {student.year} Sem {student.semester}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                                                                {student.attendancePercentage.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg border border-green-200">
                                        ✅ No students with low attendance
                                    </div>
                                )}
                            </div>

                            {/* Low Marks */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingDown className="text-red-600" size={20} />
                                    Students with Low Marks ({lowMarksStudents.length})
                                </h3>
                                {lowMarksStudents.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-red-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">USN</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Average Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {lowMarksStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{student.usn}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">Year {student.year} Sem {student.semester}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                                {student.averageMarks.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg border border-green-200">
                                        ✅ No students with low marks
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
