import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Calendar, BookOpen, Users, Award } from 'lucide-react';
import { examService, type Exam } from '../../services/examService';
import { classService } from '../../services/classService';
import { facultyService } from '../../services/facultyService';
import { timetableService } from '../../services/timetableService';

export const ExamManagement = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        examName: '',
        classId: '',
        facultyId: '',
        subject: '',
        maxMarks: 100,
        minMarks: 35,
        examDate: '',
        duration: 180,
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch subjects from timetable when class is selected
    useEffect(() => {
        if (formData.classId) {
            fetchSubjectsForClass(formData.classId);
        } else {
            setAvailableSubjects([]);
        }
    }, [formData.classId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examsData, classesData, facultyData] = await Promise.all([
                examService.getAll(),
                classService.getAll(),
                facultyService.getAll()
            ]);
            setExams(examsData);
            setClasses(classesData);
            setFaculty(facultyData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectsForClass = async (classId: string) => {
        try {
            const timetable = await timetableService.getByClass(classId);
            // Extract unique subjects from timetable
            const subjects = [...new Set(timetable.map((t: any) => t.subject).filter(Boolean))];
            setAvailableSubjects(subjects as string[]);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            setAvailableSubjects([]);
        }
    };

    const handleAdd = () => {
        setEditingExam(null);
        setFormData({
            examName: '',
            classId: '',
            facultyId: '',
            subject: '',
            maxMarks: 100,
            minMarks: 35,
            examDate: '',
            duration: 180,
            description: ''
        });
        setIsFormOpen(true);
    };

    const handleEdit = (exam: Exam) => {
        setEditingExam(exam);
        setFormData({
            examName: exam.examName,
            classId: exam.classId,
            facultyId: exam.facultyId,
            subject: exam.subject,
            maxMarks: exam.maxMarks,
            minMarks: exam.minMarks,
            examDate: exam.examDate.split('T')[0],
            duration: exam.duration || 180,
            description: exam.description || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await examService.delete(id);
            setExams(exams.filter(e => e.id !== id));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Failed to delete exam:', error);
            alert('Failed to delete exam');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.minMarks >= formData.maxMarks) {
            alert('Minimum marks must be less than maximum marks');
            return;
        }

        try {
            if (editingExam) {
                await examService.update(editingExam.id, formData);
            } else {
                await examService.create(formData);
            }
            fetchData();
            setIsFormOpen(false);
        } catch (error: any) {
            console.error('Failed to save exam:', error);
            alert(error.response?.data?.error || 'Failed to save exam');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxMarks' || name === 'minMarks' || name === 'duration'
                ? Number(value)
                : value
        }));
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
                    <p className="text-gray-500">Create and manage exams, assessments, and evaluations</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all"
                >
                    <Plus size={20} />
                    <span>Create Exam</span>
                </button>
            </header>

            {/* Exams Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Exam Name</th>
                                <th className="p-4">Class & Subject</th>
                                <th className="p-4">Faculty</th>
                                <th className="p-4">Marks</th>
                                <th className="p-4">Date & Duration</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading exams...</td>
                                </tr>
                            ) : exams.length > 0 ? (
                                exams.map(exam => (
                                    <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <Award className="h-4 w-4 text-amber-500" />
                                                {exam.examName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{exam.className}</div>
                                                <div className="text-gray-500">
                                                    Year {exam.year} - Sem {exam.semester} ({exam.classSection})
                                                </div>
                                                <div className="text-xs text-indigo-600 font-medium mt-1">
                                                    <BookOpen className="inline h-3 w-3 mr-1" />
                                                    {exam.subject}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">{exam.facultyName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="font-bold text-green-600">Max: {exam.maxMarks}</div>
                                                <div className="text-gray-500">Min: {exam.minMarks}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1 text-gray-700">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(exam.examDate).toLocaleDateString()}
                                                </div>
                                                {exam.duration && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {exam.duration} minutes
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(exam)}
                                                    className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(exam.id)}
                                                    className="p-2 bg-gray-50 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                        No exams found. Create your first exam!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingExam ? `Edit Exam: ${editingExam.examName}` : "Create New Exam"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Exam Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                        <input
                            name="examName"
                            value={formData.examName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g., Mid-Term Exam 2024"
                        />
                    </div>

                    {/* Class & Subject */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
                            Class & Subject
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} - Year {cls.year} Sem {cls.semester} ({cls.section})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.classId}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {formData.classId ? 'Select Subject' : 'Select Class First'}
                                    </option>
                                    {availableSubjects.map((subject, idx) => (
                                        <option key={idx} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                                {formData.classId && availableSubjects.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        No subjects found in timetable for this class
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Faculty */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
                        <select
                            name="facultyId"
                            value={formData.facultyId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select Faculty</option>
                            {faculty.map(fac => (
                                <option key={fac.id} value={fac.id}>
                                    {fac.name} ({fac.designation})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Marks */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
                            Marks Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks *</label>
                                <input
                                    type="number"
                                    name="maxMarks"
                                    value={formData.maxMarks}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Marks (Pass) *</label>
                                <input
                                    type="number"
                                    name="minMarks"
                                    value={formData.minMarks}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date & Duration */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
                            Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date *</label>
                                <input
                                    type="date"
                                    name="examDate"
                                    value={formData.examDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Additional notes or instructions..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                        >
                            {editingExam ? 'Update Exam' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete this exam? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                        >
                            Delete Exam
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
