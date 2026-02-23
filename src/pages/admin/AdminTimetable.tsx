import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { timetableService } from '../../services/timetableService';
import { facultyService } from '../../services/facultyService';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Loader2, Save, Calendar, BookOpen, Clock, MapPin, User } from 'lucide-react';
import type { ClassSection, TimetablePeriod, Staff } from '../../types';

export const AdminTimetable = () => {
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState<Staff[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ day: string; period: number } | null>(null);
    const [formData, setFormData] = useState({
        subject: '',
        facultyId: '',
        roomNumber: ''
    });
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string, emailStatus?: string } | null>(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [1, 2, 3, 4, 5, 6, 7];

    useEffect(() => {
        fetchClasses();
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchTimetable(selectedClassId);
        } else {
            setTimetable([]);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        }
    };

    const fetchFaculties = async () => {
        try {
            const data = await facultyService.getAll();
            setFaculties(data);
        } catch (error) {
            console.error('Failed to fetch faculties', error);
        }
    };

    const fetchTimetable = async (classId: string) => {
        setLoading(true);
        try {
            const data = await timetableService.getByClass(classId);
            setTimetable(data);
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day: string, period: number) => {
        if (!selectedClassId) return;

        const existing = timetable.find(t => t.day === day && t.period === period);
        setEditingSlot({ day, period });
        setFormData({
            subject: existing?.subject || '',
            facultyId: existing?.staffId || '',
            roomNumber: existing?.roomId || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedClassId || !editingSlot) return;

        try {
            const res = await timetableService.create({
                class_id: selectedClassId,
                day_of_week: editingSlot.day,
                period_number: editingSlot.period,
                subject: formData.subject,
                faculty_id: formData.facultyId,
                room_number: formData.roomNumber
            });

            // Refresh
            await fetchTimetable(selectedClassId);
            setIsModalOpen(false);

            // Set notification based on emailStatus
            let emailMsg = '';
            let type: 'success' | 'warning' = 'success';

            if (res.emailStatus === 'sent') {
                emailMsg = 'Notification email sent to faculty.';
            } else if (res.emailStatus === 'no_email') {
                emailMsg = 'Faculty assigned, but no email found in profile.';
                type = 'warning';
            } else if (res.emailStatus === 'error') {
                emailMsg = 'Timetable saved, but email notification failed.';
                type = 'warning';
            } else if (res.emailStatus === 'no_faculty') {
                emailMsg = 'Slot updated (No faculty assigned).';
            }

            setNotification({
                type,
                message: res.message,
                emailStatus: emailMsg
            });

            // Auto hide after 5 seconds
            setTimeout(() => setNotification(null), 5000);

        } catch (error: any) {
            console.error('Failed to save timetable entry', error.response?.data || error);
            setNotification({
                type: 'error',
                message: error.response?.data?.error || 'Failed to save timetable entry'
            });
        }
    };

    const getCellContent = (day: string, period: number) => {
        const entry = timetable.find(t => t.day === day && t.period === period);
        if (!entry) return null;

        return (
            <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-indigo-700 truncate block w-full" title={entry.subject}>
                    {entry.subject}
                </span>
                <span className="text-gray-600 truncate block w-full flex items-center gap-1" title={entry.facultyName}>
                    <User size={10} /> {entry.facultyName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] w-fit flex items-center gap-1">
                    <MapPin size={8} /> {entry.roomId || 'N/A'}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto relative">
            {/* Notifications */}
            {notification && (
                <div className={`fixed top-20 right-4 z-[100] max-w-sm w-full bg-white rounded-2xl shadow-2xl border-l-4 p-4 animate-in fade-in slide-in-from-right-4 duration-300 ${notification.type === 'success' ? 'border-green-500' :
                        notification.type === 'warning' ? 'border-amber-500' : 'border-red-500'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl shrink-0 ${notification.type === 'success' ? 'bg-green-50 text-green-600' :
                                notification.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {notification.type === 'success' ? <Save size={20} /> : <Loader2 size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900">{notification.message}</h4>
                            {notification.emailStatus && (
                                <p className="text-xs text-gray-500 mt-1">{notification.emailStatus}</p>
                            )}
                        </div>
                        <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
                            <Plus size={18} className="rotate-45" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="text-indigo-600" />
                        Timetable Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and organize weekly class schedules</p>
                </div>

                <div className="w-full md:w-72">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class Setup</label>
                    <div className="relative">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-sm transition-all"
                        >
                            <option value="">-- Choose Class --</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} (Year {cls.year}, Sem {cls.semester})
                                </option>
                            ))}
                        </select>
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {!selectedClassId ? (
                        <div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <BookOpen className="h-8 w-8 text-indigo-200" />
                            </div>
                            <p className="font-medium text-gray-600">No Class Selected</p>
                            <p className="text-sm">Please select a class from the dropdown above to manage the timetable.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-96 flex flex-col items-center justify-center text-indigo-600">
                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                            <p className="font-medium">Loading schedule...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b border-r bg-gray-50/80 w-32 text-left font-semibold text-gray-600 text-sm sticky left-0 z-10 backdrop-blur-sm">
                                        Day / Period
                                    </th>
                                    {periods.map(p => (
                                        <th key={p} className="p-4 border-b bg-gray-50/50 text-center font-semibold text-gray-600 text-sm w-[12%]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span>Period {p}</span>
                                                <span className="text-[10px] font-normal text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                                                    {p === 1 ? '09:00 - 10:00' :
                                                        p === 2 ? '10:00 - 11:00' :
                                                            p === 3 ? '11:15 - 12:15' : '...'}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map(day => (
                                    <tr key={day} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 border-b border-r font-medium text-gray-700 text-sm bg-white sticky left-0 z-10 group-hover:bg-gray-50/30">
                                            {day}
                                        </td>
                                        {periods.map(period => (
                                            <td
                                                key={`${day}-${period}`}
                                                className="p-2 border-b border-r border-gray-100 last:border-r-0 h-32 align-top relative cursor-pointer hover:bg-indigo-50/40 transition-all duration-200"
                                                onClick={() => handleCellClick(day, period)}
                                            >
                                                <div className="h-full w-full rounded-lg border border-transparent hover:border-indigo-100 p-2 transition-all">
                                                    {getCellContent(day, period) || (
                                                        <div className="h-full w-full flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <div className="bg-indigo-50 p-2 rounded-full mb-1">
                                                                <Plus className="h-4 w-4 text-indigo-500" />
                                                            </div>
                                                            <span className="text-xs font-medium text-indigo-500">Add Class</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSlot ? `Edit ${editingSlot.day} - Period ${editingSlot.period}` : 'Edit Slot'}
            >
                {editingSlot && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <BookOpen size={16} /> Subject Name
                            </label>
                            <input
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g. Database Management Systems"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} /> Assign Faculty
                            </label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.facultyId}
                                onChange={v => setFormData({ ...formData, facultyId: v.target.value })}
                            >
                                <option value="">Select Faculty Member</option>
                                {faculties.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.firstName} {f.lastName} ({f.department || 'CSE'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin size={16} /> Room Number
                            </label>
                            <input
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.roomNumber}
                                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                placeholder="e.g. 204"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
