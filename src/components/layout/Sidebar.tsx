import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Calendar, Clock,
    LogOut, GraduationCap, UserCircle, X
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Role } from '../../types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Faculty', path: '/admin/faculty', icon: Users },
        { name: 'Class Setup', path: '/admin/academics', icon: BookOpen },
        { name: 'Student List', path: '/admin/students', icon: GraduationCap },
        { name: 'Timetable', path: '/admin/timetable', icon: Calendar },
        { name: 'Exam Management', path: '/admin/exams', icon: BookOpen },
        { name: 'Profile', path: '/admin/profile', icon: UserCircle },
    ];

    const roleLinks: Record<Role, { name: string; path: string; icon: any }[]> = {
        admin: adminLinks,
        // HOD has full access — same as Super Admin
        hod: adminLinks,
        staff: [
            { name: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
            { name: 'My Schedule', path: '/staff/schedule', icon: Calendar },
            { name: 'Exam Grades', path: '/staff/exam-grades', icon: BookOpen },
            { name: 'Attendance', path: '/staff/attendance', icon: Users },
            { name: 'Profile', path: '/staff/profile', icon: UserCircle },
        ],
        student: [
            { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
            { name: "Subjects", path: '/student/subjects', icon: BookOpen },
            { name: "Today's Class", path: '/student/today', icon: Clock },
            { name: 'Weekly Timetable', path: '/student/timetable', icon: Calendar },
            { name: 'Exams & Marks', path: '/student/exams', icon: BookOpen },
            { name: 'Profile', path: '/student/profile', icon: UserCircle },
        ]
    };

    const currentLinks = roleLinks[user.role] || [];

    return (
        <aside
            className={clsx(
                "fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-50 shadow-xl shadow-green-900/5",
                "lg:translate-x-0 w-64",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
                <div className="font-black text-2xl tracking-tight text-primary flex items-center gap-2">
                    SIET
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden text-gray-400 hover:text-primary transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-3">
                <div className="space-y-1">
                    {currentLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-primary to-green-400 text-white shadow-lg shadow-green-200"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <link.icon size={20} className={isActive ? "text-white" : ""} />
                                    <span className="text-sm">{link.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-gray-100 p-4">
                <div className="mb-3 px-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Logged in as
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                        {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {user.role}
                    </p>
                </div>
                <button
                    onClick={() => {
                        logout();
                        onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                    <LogOut size={20} />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};
