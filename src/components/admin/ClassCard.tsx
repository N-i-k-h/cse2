import { useNavigate } from 'react-router-dom';
import { User, Users, MapPin, Calendar, GraduationCap } from 'lucide-react';
import type { ClassSection, Staff } from '../../types';

interface ClassCardProps {
    classData: ClassSection;
    classTeacher?: Staff;
    studentCount: number;
}

export const ClassCard = ({ classData, classTeacher, studentCount }: ClassCardProps) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{classData.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Semester {classData.semester}</p>
                </div>
                {classData.roomNumber && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <MapPin size={10} /> {classData.roomNumber}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex-1 space-y-4">
                {/* Class Teacher */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Class Teacher</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {classTeacher?.name || 'Not Assigned'}
                        </p>
                    </div>
                </div>

                {/* Student Count */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Students</p>
                        <p className="text-sm font-medium text-gray-900">{studentCount} Students</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate(`/admin/students?classId=${classData.id}`)}
                    className="flex justify-center items-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                    <GraduationCap size={16} />
                    <span>Students</span>
                </button>
                <button
                    onClick={() => navigate(`/admin/timetable?classId=${classData.id}`)}
                    className="flex justify-center items-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                    <Calendar size={16} />
                    <span>Timetable</span>
                </button>
            </div>
        </div>
    );
};
