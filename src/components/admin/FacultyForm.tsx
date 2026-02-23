import { useState, useEffect } from 'react';
import type { Staff } from '../../types';
import { Save, UserCog } from 'lucide-react';

interface FacultyFormProps {
    initialData?: Staff | null;
    onSubmit: (data: Partial<Staff>) => void;
    onCancel: () => void;
}

export const FacultyForm = ({ initialData, onSubmit, onCancel }: FacultyFormProps) => {
    const defaultData: Partial<Staff> = {
        name: '', firstName: '', lastName: '', email: '', department: 'CSE', role: 'staff',
        designation: 'Assistant Professor', subjects: [],
        phone: '', highestDegree: 'M.Tech',
        experienceTotal: 0, experienceResearch: 0, experienceIndustry: 0,
        // @ts-ignore
        facultyId: ''
    };

    const [formData, setFormData] = useState<Partial<Staff>>(defaultData);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(defaultData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Identity & Contact */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <UserCog size={16} /> Identity &amp; Contact
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

                    {/* Faculty ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                        {/* @ts-ignore */}
                        <input name="facultyId" value={formData.facultyId || ''} onChange={e => setFormData(prev => ({ ...prev, facultyId: e.target.value.toUpperCase() }))}
                            required={!initialData} disabled={!!initialData}
                            className="input-field uppercase" placeholder="e.g. SIET001" />
                        {!initialData && (
                            <p className="text-xs text-gray-400 mt-1">💡 Faculty ID will also be the default login password.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" value={formData.email || ''} onChange={handleChange} required className="input-field" placeholder="faculty@example.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} className="input-field" placeholder="9876543210" />
                    </div>
                </div>
            </div>

            {/* 2. Academic Profile */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Academic Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                            <option value="staff">Teaching Staff</option>
                            <option value="hod">HOD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select name="designation" value={formData.designation} onChange={handleChange} className="input-field">
                            <option value="Professor">Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Lecturer">Lecturer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Highest Degree</label>
                        <select name="highestDegree" value={formData.highestDegree} onChange={handleChange} className="input-field">
                            <option value="PhD">PhD</option>
                            <option value="M.Tech">M.Tech</option>
                            <option value="M.Sc">M.Sc</option>
                            <option value="B.Tech">B.Tech</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Experience (Years)</label>
                        <input type="number" name="experienceTotal" value={formData.experienceTotal} onChange={handleChange} className="input-field" min={0} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Research Exp (Years)</label>
                        <input type="number" name="experienceResearch" value={formData.experienceResearch} onChange={handleChange} className="input-field" min={0} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry Exp (Years)</label>
                        <input type="number" name="experienceIndustry" value={formData.experienceIndustry || 0} onChange={handleChange} className="input-field" min={0} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    <span>{initialData ? 'Update Faculty' : 'Create Faculty Account'}</span>
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
                }
                .input-field:focus {
                    border-color: #22C55E;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }
                .input-field:disabled {
                    background-color: #F9FAFB;
                    color: #6B7280;
                    cursor: not-allowed;
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
