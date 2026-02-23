import { useState, useEffect } from 'react';
import { ProfileReport } from '../../components/common/ProfileReport';
import { Search, ChevronDown, Filter } from 'lucide-react';
import type { Student } from '../../types';
import { studentService } from '../../services/studentService';

export const DeptOverview = () => {
    // Basic HOD view - List of students to view their profiles
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Fetch all students for the department (API defaults to user's scope usually, or all if admin/hod)
                const data = await studentService.getAll();
                setStudentList(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = studentList.filter(s =>
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.usn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {!selectedStudent ? (
                <>
                    <header>
                        <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
                        <p className="text-gray-500">View performance reports for all students</p>
                    </header>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by USN or Name..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                <Filter size={16} />
                                <span>Filter</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {loading ? (
                                <div className="col-span-full py-12 text-center text-gray-500">Loading student data...</div>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className="p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center font-bold text-gray-500 transition-colors">
                                                {(student.name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{student.name}</h4>
                                                <p className="text-xs text-gray-500">{student.usn}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2 text-xs text-gray-500">
                                            <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">Sem {student.semester}</span>
                                            <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">Sec {student.section}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-gray-400">
                                    No students found matching your search.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                        <ChevronDown className="rotate-90" size={20} />
                        Back to Student List
                    </button>
                    <ProfileReport user={selectedStudent} />
                </div>
            )}
        </div>
    );
};
