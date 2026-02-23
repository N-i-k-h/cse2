import api from './api';
import type { Staff } from '../types';

export const facultyService = {
    // Get all faculty with optional filters
    getAll: async (filters?: { designation?: string; degree?: string; experience?: string }) => {
        const params = new URLSearchParams();
        if (filters?.designation) params.append('designation', filters.designation);
        if (filters?.degree) params.append('degree', filters.degree);
        if (filters?.experience) params.append('experience', filters.experience);

        const response = await api.get(`/faculty?${params.toString()}`);
        return response.data;
    },

    // Get single faculty
    getById: async (id: string) => {
        const response = await api.get(`/faculty/${id}`);
        return response.data;
    },

    // Create new faculty
    create: async (facultyData: {
        email: string;
        password: string;
        role?: string;
        firstName: string;
        lastName: string;
        phone?: string;
        pan?: string;
        aadhaar?: string;
        designation: string;
        highestDegree?: string;
        experienceTotal?: number;
        experienceResearch?: number;
        experienceIndustry?: number;
    }) => {
        const response = await api.post('/faculty', facultyData);
        return response.data;
    },

    // Update faculty
    update: async (id: string, facultyData: Partial<Staff>) => {
        const response = await api.put(`/faculty/${id}`, facultyData);
        return response.data;
    },

    // Update faculty password
    updatePassword: async (id: string, newPassword: string) => {
        const response = await api.put(`/faculty/${id}/password`, { newPassword });
        return response.data;
    },

    // Delete faculty
    delete: async (id: string) => {
        const response = await api.delete(`/faculty/${id}`);
        return response.data;
    },
};
