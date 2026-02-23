export type Role = 'admin' | 'hod' | 'staff' | 'student';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    department?: string;
    profileId?: string;
    avatar?: string;
}

export interface Student extends User {
    firstName?: string;
    lastName?: string;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
    usn: string;
    year: number;
    semester: number;
    section: string; // e.g., 'A', 'B'
    attendance: { [subject: string]: number }; // percentage
    marks: {
        midterm: { [subject: string]: number };
        lab: { [subject: string]: number };
    };
    classId?: string;
}

export interface Staff extends User {
    designation: string; // e.g. 'Assistant Professor'
    subjects: string[];
    // Extended fields
    firstName?: string;
    lastName?: string;
    pan?: string;
    aadhaar?: string;
    phone?: string;
    highestDegree?: 'PhD' | 'M.Tech' | 'B.Tech' | 'M.Sc' | 'Other';
    experienceTotal?: number; // Years
    experienceResearch?: number; // Years
    experienceIndustry?: number; // Years
}

export interface TimetablePeriod {
    day: string;
    period: number; // 1-7
    subject: string;
    staffId: string;
    roomId?: string;
    classId?: string; // Optional for backward compat with existing mock data, but should be required ideally
    facultyName?: string;
    className?: string; // Optional for faculty view
    section?: string;   // Optional for faculty view
}

export interface ClassSection {
    id: string;
    name: string; // e.g. CSE-A
    year: number;
    semester: number;
    section?: string; // e.g. 'A'
    roomNumber?: string;
    classTeacherId: string;
}
