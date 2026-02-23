import api from './api';

export interface ExamGrade {
    id?: string;
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
    gradedBy?: string;
    gradedAt?: string;
}

export interface StudentWithGrade {
    id: string;
    firstName: string;
    lastName: string;
    usn: string;
    marksObtained?: number;
    remarks?: string;
    gradeId?: string;
    hasGrade: boolean;
}

export interface FacultyExam {
    id: string;
    examName: string;
    subject: string;
    className: string;
    classSection: string;
    year: number;
    semester: number;
    maxMarks: number;
    minMarks: number;
    examDate: string;
    totalStudents: number;
    gradedCount: number;
    classId: string;
}

export const examGradeService = {
    // Get all exams for a faculty
    getFacultyExams: async (facultyId: string) => {
        const response = await api.get(`/exam-grades/faculty/${facultyId}/exams`);
        return response.data;
    },

    // Get students for an exam with their grades
    getExamStudents: async (examId: string) => {
        const response = await api.get(`/exam-grades/exam/${examId}/students`);
        return response.data;
    },

    // Submit single grade
    submitGrade: async (gradeData: ExamGrade) => {
        const response = await api.post('/exam-grades', gradeData);
        return response.data;
    },

    // Submit bulk grades
    submitBulkGrades: async (examId: string, grades: ExamGrade[], facultyId: string) => {
        const response = await api.post('/exam-grades/bulk', {
            examId,
            grades,
            facultyId
        });
        return response.data;
    },

    // Delete grade
    deleteGrade: async (gradeId: string) => {
        const response = await api.delete(`/exam-grades/${gradeId}`);
        return response.data;
    },
};
