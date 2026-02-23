import type { User, Student, Staff, ClassSection, TimetablePeriod } from '../types';

export const mockUsers: User[] = [
    { id: 'admin1', name: 'Super Admin', email: 'admin@cse', role: 'admin', department: 'CSE' },
    { id: 'hod1', name: 'Dr. HOD CSE', email: 'hod@cse', role: 'hod', department: 'CSE' },
    // Staff
    { id: 'staff1', name: 'Prof. Alice', email: 'alice@cse', role: 'staff', department: 'CSE' },
    { id: 'staff2', name: 'Prof. Bob', email: 'bob@cse', role: 'staff', department: 'CSE' },
    { id: 'staff3', name: 'Prof. Charlie', email: 'charlie@cse', role: 'staff', department: 'CSE' },
    // Students
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `student${i + 1}`,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@cse`,
        role: 'student' as const,
        department: 'CSE'
    }))
];

export const mockStaff: Staff[] = [
    {
        ...(mockUsers.find(u => u.id === 'hod1')! as User),
        designation: 'HOD',
        subjects: ['Advanced Algorithms'],
        pan: 'ABCDE1234F', aadhaar: '123456789012', phone: '9876543210', highestDegree: 'PhD', experienceTotal: 15, experienceResearch: 8
    },
    {
        ...(mockUsers.find(u => u.id === 'staff1')! as User),
        designation: 'Assistant Professor',
        subjects: ['Java', 'OS'],
        pan: 'BCDEF2345G', aadhaar: '234567890123', phone: '8765432109', highestDegree: 'M.Tech', experienceTotal: 5, experienceResearch: 1
    },
    {
        ...(mockUsers.find(u => u.id === 'staff2')! as User),
        designation: 'Assistant Professor',
        subjects: ['DBMS'],
        pan: 'CDEFG3456H', aadhaar: '345678901234', phone: '7654321098', highestDegree: 'PhD', experienceTotal: 12, experienceResearch: 5
    },
    {
        ...(mockUsers.find(u => u.id === 'staff3')! as User),
        designation: 'Lecturer',
        subjects: ['Web Development'],
        pan: 'DEFGH4567I', aadhaar: '456789012345', phone: '6543210987', highestDegree: 'B.Tech', experienceTotal: 2, experienceResearch: 0
    },
];

export const mockStudents: Student[] = mockUsers
    .filter(u => u.role === 'student')
    .map((u, i) => {
        // Force Student 1 and 2 to have low attendance (Alert Zone)
        const isAtRisk = i < 2;
        return {
            ...(u as User),
            usn: `1SI23CS${(i + 1).toString().padStart(3, '0')}`,
            year: (i % 4) + 1, // Randomize year 1-4
            semester: 4,
            section: 'A',
            attendance: isAtRisk
                ? { 'Java': 65, 'OS': 70, 'DBMS': 60 } // Low attendance
                : { 'Java': 85 + (i % 10), 'OS': 90 - (i % 10), 'DBMS': 75 + (i % 5) },
            marks: {
                midterm: { 'Java': 20 + (i % 5), 'OS': 18 + (i % 5), 'DBMS': 22 + (i % 3) },
                lab: { 'Java': 24, 'OS': 23 }
            }
        };
    });

// Mock Data for "Consecutive Absence" Alert Zone
export const mockAlertZone = [
    { id: 'alert1', studentId: 'student1', studentName: 'Student 1', usn: '1SI23CS001', subject: 'Java', consecutiveAbsences: 3, teacherName: 'Prof. Alice' },
    { id: 'alert2', studentId: 'student2', studentName: 'Student 2', usn: '1SI23CS002', subject: 'DBMS', consecutiveAbsences: 4, teacherName: 'Prof. Bob' },
];

export const mockClasses: ClassSection[] = [
    { id: 'csea', name: '2nd Year CSE - A', year: 2, semester: 4, section: 'A', roomNumber: '201', classTeacherId: 'staff1' }
];

export const mockTimetable: TimetablePeriod[] = [
    // Monday
    { day: 'Monday', period: 1, subject: 'Java', staffId: 'staff1', classId: 'csea' },
    { day: 'Monday', period: 2, subject: 'OS', staffId: 'staff1', classId: 'csea' },
    { day: 'Monday', period: 3, subject: 'DBMS', staffId: 'staff2', classId: 'csea' },
    { day: 'Monday', period: 4, subject: 'Web Dev', staffId: 'staff3', classId: 'csea' },
    // Tuesday
    { day: 'Tuesday', period: 1, subject: 'OS', staffId: 'staff1', classId: 'csea' },
    { day: 'Tuesday', period: 2, subject: 'Java', staffId: 'staff1', classId: 'csea' },
];
