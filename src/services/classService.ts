import api from './api';
import type { ClassSection } from '../types';

export const classService = {
    // Get all classes with optional filters
    getAll: async (filters?: { year?: number; semester?: number }) => {
        const params = new URLSearchParams();
        if (filters?.year) params.append('year', filters.year.toString());
        if (filters?.semester) params.append('semester', filters.semester.toString());

        const response = await api.get(`/classes?${params.toString()}`);
        return response.data;
    },

    // Get single class
    getById: async (id: string) => {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    },

    // Create new class
    create: async (classData: {
        name: string;
        year: number;
        semester: number;
        section: string;
        roomNumber?: string;
        classTeacherId?: string;
    }) => {
        const response = await api.post('/classes', classData);
        return response.data;
    },

    // Update class
    update: async (id: string, classData: Partial<ClassSection>) => {
        const response = await api.put(`/classes/${id}`, classData);
        return response.data;
    },

    // Delete class
    delete: async (id: string) => {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    },

    // Get students in a class
    getStudents: async (id: string) => {
        const response = await api.get(`/classes/${id}/students`);
        return response.data;
    },
};
