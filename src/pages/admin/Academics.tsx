import { useState, useEffect } from 'react';
import { ClassCard } from '../../components/admin/ClassCard';
import { Modal } from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
import type { ClassSection, Staff } from '../../types';
import { classService } from '../../services/classService';
import { facultyService } from '../../services/facultyService';

export const Academics = () => {
    // State
    const [classes, setClasses] = useState<(ClassSection & { student_count?: number })[]>([]);
    const [facultyList, setFacultyList] = useState<Staff[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState<{
        year: number;
        semester: number;
        section: string;
        roomNumber: string;
        classTeacherId: string;
    }>({
        year: 1,
        semester: 1,
        section: '',
        roomNumber: '',
        classTeacherId: ''
    });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch classes and faculty in parallel
                const [classesData, facultyData] = await Promise.all([
                    classService.getAll(),
                    facultyService.getAll()
                ]);
                setClasses(classesData);
                setFacultyList(facultyData);
            } catch (error) {
                console.error("Failed to fetch academic data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Helpers ---
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newClassPayload = {
                name: `${formData.year}${getOrdinal(formData.year)} Year CSE - Sem ${formData.semester} - ${formData.section}`,
                year: formData.year,
                semester: formData.semester,
                section: formData.section.toUpperCase(),
                roomNumber: formData.roomNumber,
                classTeacherId: formData.classTeacherId
            };

            await classService.create(newClassPayload);

            // Refresh list
            const updatedClasses = await classService.getAll();
            setClasses(updatedClasses);

            setIsModalOpen(false);
            // Reset form
            setFormData({ year: 1, semester: 1, section: '', roomNumber: '', classTeacherId: '' });
        } catch (error) {
            console.error("Failed to create class", error);
            alert("Failed to create class");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Setup</h1>
                    <p className="text-gray-500">Manage academic classes, sections, and room assignments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all"
                >
                    <Plus size={20} />
                    <span>Create New Class</span>
                </button>
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading classes...</div>
                ) : classes.length > 0 ? (
                    classes.map(cls => (
                        <ClassCard
                            key={cls.id}
                            classData={cls}
                            classTeacher={facultyList.find(s => s.id === cls.classTeacherId)}
                            studentCount={cls.student_count || 0}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        No classes found. Create one to get started.
                    </div>
                )}
            </div>

            {/* Create Class Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Class Section"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                required
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value={1}>1st Year</option>
                                <option value={2}>2nd Year</option>
                                <option value={3}>3rd Year</option>
                                <option value={4}>4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                required
                                value={formData.semester}
                                onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                    <option key={s} value={s}>Semester {s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. A, B"
                                value={formData.section}
                                onChange={e => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. 204"
                            value={formData.roomNumber}
                            onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                        <select
                            required
                            value={formData.classTeacherId}
                            onChange={e => setFormData({ ...formData, classTeacherId: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select Faculty...</option>
                            {facultyList.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.designation})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-100"
                        >
                            Save Class
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
