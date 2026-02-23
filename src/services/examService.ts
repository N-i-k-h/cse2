import api from './api';

export interface Exam {
    id: string;
    examName: string;
    classId: string;
    className?: string;
    classSection?: string;
    year?: number;
    semester?: number;
    facultyId: string;
    facultyName?: string;
    subject: string;
    maxMarks: number;
    minMarks: number;
    examDate: string;
    duration?: number;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
}

export const examService = {
    // Get all exams
    getAll: async (filters?: { classId?: string; facultyId?: string; subject?: string }) => {
        const params = new URLSearchParams();
        if (filters?.classId) params.append('classId', filters.classId);
        if (filters?.facultyId) params.append('facultyId', filters.facultyId);
        if (filters?.subject) params.append('subject', filters.subject);

        const response = await api.get(`/exams?${params.toString()}`);
        return response.data;
    },

    // Get single exam
    getById: async (id: string) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },

    // Create exam
    create: async (examData: Omit<Exam, 'id'>) => {
        const response = await api.post('/exams', examData);
        return response.data;
    },

    // Update exam
    update: async (id: string, examData: Partial<Exam>) => {
        const response = await api.put(`/exams/${id}`, examData);
        return response.data;
    },

    // Delete exam
    delete: async (id: string) => {
        const response = await api.delete(`/exams/${id}`);
        return response.data;
    },
};
