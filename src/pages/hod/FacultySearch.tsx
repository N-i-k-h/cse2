import { useState, useEffect } from 'react';
import { Search, Mail, BookOpen, User as UserIcon } from 'lucide-react';
import type { Staff } from '../../types';
import { facultyService } from '../../services/facultyService';

export const FacultySearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaculty = async () => {
            setLoading(true);
            try {
                const data = await facultyService.getAll();
                setStaffList(data);
            } catch (error) {
                console.error("Failed to fetch faculty", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Faculty Search</h1>
                <p className="text-gray-500">View staff details and teaching loads</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or Designation..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading faculty directory...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.length > 0 ? filteredStaff.map(staff => (
                        <div key={staff.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                                    {staff.name.charAt(0)}
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                                    {staff.designation}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{staff.name}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                <Mail size={14} />
                                {staff.email}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <BookOpen size={16} /> Subjects
                                    </span>
                                    <span className="font-medium text-gray-900 text-right max-w-[150px] truncate">
                                        {Array.isArray(staff.subjects) ? staff.subjects.join(', ') : (staff.subjects || 'None')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <UserIcon size={16} /> Load
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        N/A
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No faculty found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


