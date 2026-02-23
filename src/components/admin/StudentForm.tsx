import { useState, useEffect } from 'react';
import type { Student } from '../../types';
import { Save, UserCog, Loader2 } from 'lucide-react';
import { classService } from '../../services/classService';

interface ClassOption {
    id: string;
    name: string;
    year: number;
    semester: number;
    section: string;
}

interface StudentFormProps {
    initialData?: Student | null;
    onSubmit: (data: Partial<Student>) => void;
    onCancel: () => void;
}

export const StudentForm = ({ initialData, onSubmit, onCancel }: StudentFormProps) => {
    const defaultData: Partial<Student> = {
        firstName: '', lastName: '', name: '', email: '',
        usn: '', phone: '', year: 1, semester: 1, section: 'A',
        role: 'student', department: 'CSE'
    };

    const [formData, setFormData] = useState<Partial<Student>>(defaultData);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    // Load classes from Class Management
    useEffect(() => {
        const fetchClasses = async () => {
            setClassesLoading(true);
            setClassesError('');
            try {
                const data = await classService.getAll();
                const mapped: ClassOption[] = data.map((c: any) => ({
                    id: c._id || c.id,
                    name: c.name,
                    year: c.year,
                    semester: c.semester,
                    section: c.section
                }));
                setClasses(mapped);
            } catch {
                setClassesError('Failed to load classes. Please create classes first in Class Setup.');
            } finally {
                setClassesLoading(false);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Try to match existing student's data to a class
            if (initialData.classId) {
                setSelectedClassId((initialData as any).classId);
            }
        } else {
            setFormData(defaultData);
            setSelectedClassId('');
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'firstName' || name === 'lastName') {
                updated.name = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
            }
            return updated;
        });
    };

    // When class is selected, auto-fill year/semester/section from that class
    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = e.target.value;
        setSelectedClassId(classId);

        if (classId) {
            const cls = classes.find(c => c.id === classId);
            if (cls) {
                setFormData(prev => ({
                    ...prev,
                    classId,
                    year: cls.year,
                    semester: cls.semester,
                    section: cls.section,
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, classId: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Student Identity */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <UserCog size={16} /> Student Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="input-field" placeholder="John" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="input-field" placeholder="Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">USN (Unique ID)</label>
                        <input
                            name="usn"
                            value={formData.usn || ''}
                            onChange={e => setFormData(prev => ({ ...prev, usn: e.target.value.toUpperCase() }))}
                            required
                            className="input-field uppercase"
                            placeholder="1SI23CS001"
                        />
                        {!initialData && (
                            <p className="text-xs text-gray-400 mt-1">💡 The USN will also serve as the student's default login password.</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" value={formData.email || ''} onChange={handleChange} required className="input-field" placeholder="student@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} className="input-field" placeholder="9876543210" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                        <input name="parentName" value={formData.parentName || ''} onChange={handleChange} className="input-field" placeholder="Parent/Guardian Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                        <input name="parentPhone" value={formData.parentPhone || ''} onChange={handleChange} className="input-field" placeholder="Parent Contact" />
                    </div>
                </div>
            </div>

            {/* 2. Class Assignment */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Class Assignment</h3>

                {classesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                        <Loader2 size={16} className="animate-spin" /> Loading classes...
                    </div>
                ) : classesError ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        ⚠️ {classesError}
                    </div>
                ) : classes.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        ⚠️ No classes found. Please add classes in <strong>Class Setup</strong> first.
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign to Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedClassId}
                            onChange={handleClassChange}
                            required
                            className="input-field"
                        >
                            <option value="">— Select a class —</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} &nbsp;·&nbsp; Year {cls.year} | Sem {cls.semester} | Sec {cls.section}
                                </option>
                            ))}
                        </select>

                        {/* Auto-filled summary */}
                        {selectedClassId && (() => {
                            const cls = classes.find(c => c.id === selectedClassId);
                            return cls ? (
                                <div className="mt-2 flex gap-3 flex-wrap">
                                    {[
                                        { label: 'Year', value: cls.year },
                                        { label: 'Semester', value: cls.semester },
                                        { label: 'Section', value: cls.section },
                                    ].map(item => (
                                        <span key={item.label} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
                                            {item.label}: <strong>{item.value}</strong>
                                        </span>
                                    ))}
                                </div>
                            ) : null;
                        })()}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    <span>{initialData ? 'Update Student' : 'Enroll Student'}</span>
                </button>
            </div>

            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 0.5rem;
                    outline: none;
                    transition: all 0.2s;
                    background: white;
                }
                .input-field:focus {
                    border-color: #22C55E;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }
                .btn-primary {
                    background-color: #22C55E;
                    color: white;
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover { background-color: #16A34A; }
                .btn-secondary {
                    color: #4B5563;
                    padding: 0.5rem 1.5rem;
                    font-weight: 500;
                }
                .btn-secondary:hover { background-color: #F3F4F6; border-radius: 0.5rem; }
            `}</style>
        </form>
    );
};
