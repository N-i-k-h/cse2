import api from './api';
import type { Student } from '../types';

export const studentService = {
    // Get all students with optional filters
    getAll: async (filters?: { year?: number; semester?: number; section?: string; classId?: string }) => {
        const params = new URLSearchParams();
        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.semester) params.append('semester', filters.semester.toString());
        if (filters?.section) params.append('section', filters.section);
        if (filters?.classId) params.append('classId', filters.classId);

        const response = await api.get(`/students?${params.toString()}`);
        return response.data;
    },

    // Get single student
    getById: async (id: string) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    // Create new student
    create: async (studentData: {
        email: string;
        password: string;
        usn: string;
        firstName: string;
        lastName: string;
        phone?: string;
        parentName?: string;
        parentPhone?: string;
        year: number;
        semester: number;
        section: string;
    }) => {
        const response = await api.post('/students', studentData);
        return response.data;
    },

    // Update student
    update: async (id: string, studentData: Partial<Student>) => {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data;
    },

    // Delete student
    delete: async (id: string) => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },

    // Get student attendance
    getAttendance: async (id: string) => {
        const response = await api.get(`/students/${id}/attendance`);
        return response.data;
    },
};
