import express from 'express';
import ExamGrade from '../models/ExamGrade.js';
import Exam from '../models/Exam.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get grades for a specific exam
router.get('/exam/:examId', authMiddleware, async (req, res) => {
    try {
        const { examId } = req.params;

        const grades = await ExamGrade.find({ examId })
            .populate('studentId', 'firstName lastName usn')
            .populate('gradedBy', 'firstName lastName')
            .sort({ 'studentId.usn': 1 });

        res.json(grades);
    } catch (error) {
        console.error('Get exam grades error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all exams for a faculty (staff)
router.get('/faculty/:facultyId/exams', authMiddleware, async (req, res) => {
    try {
        const { facultyId } = req.params;

        const exams = await Exam.find({ facultyId })
            .populate('classId', 'name section year semester')
            .sort({ examDate: -1 });

        // For each exam, get grade count
        const examsWithStats = await Promise.all(
            exams.map(async (exam) => {
                const gradeCount = await ExamGrade.countDocuments({ examId: exam._id });

                // Get total students in the class - try classId first, then year/semester/section
                let students = await Student.find({ classId: exam.classId._id });

                if (students.length === 0) {
                    students = await Student.find({
                        year: exam.classId.year,
                        semester: exam.classId.semester,
                        section: exam.classId.section
                    });
                }

                return {
                    id: exam._id,
                    examName: exam.examName,
                    subject: exam.subject,
                    className: exam.classId.name,
                    classSection: exam.classId.section,
                    year: exam.classId.year,
                    semester: exam.classId.semester,
                    maxMarks: exam.maxMarks,
                    minMarks: exam.minMarks,
                    examDate: exam.examDate,
                    totalStudents: students.length,
                    gradedCount: gradeCount,
                    classId: exam.classId._id
                };
            })
        );

        res.json(examsWithStats);
    } catch (error) {
        console.error('Get faculty exams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get students for an exam with their grades
router.get('/exam/:examId/students', authMiddleware, async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId).populate('classId');
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        console.log('📚 Fetching students for exam:', exam.examName);
        console.log('📋 Class ID:', exam.classId._id);
        console.log('📋 Class details:', exam.classId.name, exam.classId.year, exam.classId.semester, exam.classId.section);

        // Try to get students by classId first, then fallback to year/semester/section
        let students = await Student.find({ classId: exam.classId._id }).sort({ usn: 1 });

        console.log('👥 Students found by classId:', students.length);

        // If no students found by classId, try year/semester/section
        if (students.length === 0) {
            console.log('⚠️ No students found by classId, trying year/semester/section...');
            students = await Student.find({
                year: exam.classId.year,
                semester: exam.classId.semester,
                section: exam.classId.section
            }).sort({ usn: 1 });
            console.log('👥 Students found by year/sem/section:', students.length);
        }

        // Get existing grades
        const grades = await ExamGrade.find({ examId });
        const gradeMap = new Map(grades.map(g => [g.studentId.toString(), g]));

        // Combine student data with grades
        const studentsWithGrades = students.map(student => ({
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            usn: student.usn,
            marksObtained: gradeMap.get(student._id.toString())?.marksObtained,
            remarks: gradeMap.get(student._id.toString())?.remarks,
            gradeId: gradeMap.get(student._id.toString())?._id,
            hasGrade: gradeMap.has(student._id.toString())
        }));

        console.log('✅ Returning', studentsWithGrades.length, 'students with grades');

        res.json(studentsWithGrades);
    } catch (error) {
        console.error('Get exam students error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit/Update grade for a student
router.post('/', authMiddleware, roleMiddleware('staff', 'hod', 'admin'), async (req, res) => {
    try {
        const { examId, studentId, marksObtained, remarks, facultyId } = req.body;

        if (!examId || !studentId || marksObtained === undefined || !facultyId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify exam exists and get max marks
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Validate marks
        if (marksObtained < 0 || marksObtained > exam.maxMarks) {
            return res.status(400).json({
                error: `Marks must be between 0 and ${exam.maxMarks}`
            });
        }

        // Upsert grade (update if exists, create if not)
        const grade = await ExamGrade.findOneAndUpdate(
            { examId, studentId },
            {
                marksObtained,
                remarks,
                gradedBy: facultyId,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({
            message: 'Grade saved successfully',
            grade
        });

    } catch (error) {
        console.error('Save grade error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Bulk submit grades
router.post('/bulk', authMiddleware, roleMiddleware('staff', 'hod', 'admin'), async (req, res) => {
    try {
        const { examId, grades, facultyId } = req.body;

        if (!examId || !grades || !Array.isArray(grades) || !facultyId) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Validate all marks
        for (const grade of grades) {
            if (grade.marksObtained < 0 || grade.marksObtained > exam.maxMarks) {
                return res.status(400).json({
                    error: `All marks must be between 0 and ${exam.maxMarks}`
                });
            }
        }

        // Bulk upsert
        const operations = grades.map(grade => ({
            updateOne: {
                filter: { examId, studentId: grade.studentId },
                update: {
                    marksObtained: grade.marksObtained,
                    remarks: grade.remarks || '',
                    gradedBy: facultyId,
                    updatedAt: new Date()
                },
                upsert: true
            }
        }));

        await ExamGrade.bulkWrite(operations);

        res.json({ message: 'Grades saved successfully' });

    } catch (error) {
        console.error('Bulk save grades error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Delete grade
router.delete('/:gradeId', authMiddleware, roleMiddleware('staff', 'hod', 'admin'), async (req, res) => {
    try {
        const { gradeId } = req.params;

        const grade = await ExamGrade.findByIdAndDelete(gradeId);
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        res.json({ message: 'Grade deleted successfully' });

    } catch (error) {
        console.error('Delete grade error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
