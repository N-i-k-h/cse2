import { useState } from 'react';
import { mockClasses, mockStudents, mockStaff } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Save, AlertCircle } from 'lucide-react';
// import type { Student } from '../../types';

export const MarksEntry = () => {
    const { user } = useAuth();
    const [selectedClassId, setSelectedClassId] = useState(mockClasses[0]?.id || '');
    const [selectedSubject, setSelectedSubject] = useState('Java'); // Mock default
    const [examType, setExamType] = useState<'midterm' | 'lab'>('midterm');

    // Mock marks state
    const [marks, setMarks] = useState<Record<string, number>>({});

    const students = mockStudents;
    const subjects = (mockStaff.find(s => s.id === user?.id)?.subjects || ['Java', 'OS']);

    const handleMarkChange = (studentId: string, value: string) => {
        const numValue = parseInt(value);
        if (value === '' || (numValue >= 0 && numValue <= 100)) {
            setMarks(prev => ({
                ...prev,
                [studentId]: numValue
            }));
        }
    };

    const saveMarks = () => {
        alert('Marks saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marks Entry</h1>
                <p className="text-gray-500 text-sm">Enter internal assessment and lab scores</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        {mockClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        {subjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Exam Type</label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setExamType('midterm')}
                            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${examType === 'midterm' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                        >Midterm</button>
                        <button
                            onClick={() => setExamType('lab')}
                            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${examType === 'lab' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                        >Lab</button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left" style={{ minWidth: 480 }}>
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 sm:px-6 py-3">#</th>
                                <th className="px-4 sm:px-6 py-3">Student Name</th>
                                <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">USN</th>
                                <th className="px-4 sm:px-6 py-3">Marks</th>
                                <th className="px-4 sm:px-6 py-3">Max</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student, idx) => {
                                // @ts-ignore
                                const currentVal = marks[student.id] ?? (student.marks[examType]?.[selectedSubject] || '');
                                return (
                                    <tr key={student.id} className="hover:bg-gray-50/30">
                                        <td className="px-4 sm:px-6 py-3 text-gray-400 font-mono text-sm">{(idx + 1).toString().padStart(2, '0')}</td>
                                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 text-sm">{student.name}</td>
                                        <td className="px-4 sm:px-6 py-3 text-gray-500 text-sm hidden sm:table-cell">{student.usn}</td>
                                        <td className="px-4 sm:px-6 py-3">
                                            <input
                                                type="number"
                                                value={currentVal}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                className="w-20 sm:w-28 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-center font-mono font-medium text-sm"
                                                min="0" max="100"
                                            />
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 text-gray-400 font-mono text-sm">/ {examType === 'midterm' ? '25' : '50'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        <AlertCircle size={14} />
                        <span>Please verify all marks before saving.</span>
                    </div>
                    <button
                        onClick={saveMarks}
                        className="bg-primary text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-green-200 hover:bg-green-600 transition-all flex items-center gap-2 text-sm"
                    >
                        <Save size={16} /> Save Marks
                    </button>
                </div>
            </div>
        </div>
    );
};
