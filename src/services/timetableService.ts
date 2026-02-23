import api from './api';
import type { TimetablePeriod } from '../types';

export const timetableService = {
    // Get all timetable entries
    getAll: async (): Promise<any[]> => {
        const response = await api.get('/timetable');
        return response.data;
    },

    // Get timetable for a faculty member
    getByFaculty: async (facultyId: string): Promise<TimetablePeriod[]> => {
        const response = await api.get(`/timetable/faculty/${facultyId}`);
        // Backend returns: class_id, day_of_week, period_number, subject, faculty_id, room_number, class_name, section
        // Frontend expects TimetablePeriod: day, period, subject, staffId, roomId, classId
        // Mapper:
        return response.data.map((item: any) => ({
            day: item.day_of_week,
            period: item.period_number,
            subject: item.subject,
            staffId: item.faculty_id?.toString(),
            roomId: item.room_number,
            classId: item.class_id?.toString(),
            className: item.class_name, // Optional extended prop?
            section: item.section
        }));
    },

    // Get timetable for a class
    getByClass: async (classId: string): Promise<TimetablePeriod[]> => {
        const response = await api.get(`/timetable/class/${classId}`);
        return response.data.map((item: any) => ({
            day: item.day_of_week,
            period: item.period_number,
            subject: item.subject,
            staffId: item.faculty_id?.toString(),
            roomId: item.room_number,
            classId: item.class_id?.toString(),
            facultyName: item.faculty_name || 'Unassigned'
        }));
    },

    // Create a new timetable entry
    create: async (data: any) => {
        // Expects: class_id, day_of_week, period_number, subject, faculty_id, room_number
        const response = await api.post('/timetable', data);
        return response.data;
    },

    // Delete a timetable entry
    delete: async (id: string) => {
        const response = await api.delete(`/timetable/${id}`);
        return response.data;
    }
};
