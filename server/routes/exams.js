import express from 'express';
import Exam from '../models/Exam.js';
import Class from '../models/Class.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all exams with populated data
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { classId, facultyId, subject } = req.query;

        const filter = {};
        if (classId) filter.classId = classId;
        if (facultyId) filter.facultyId = facultyId;
        if (subject) filter.subject = subject;

        const exams = await Exam.find(filter)
            .populate('classId', 'name section year semester')
            .populate('facultyId', 'firstName lastName')
            .sort({ examDate: -1 });

        // Transform for frontend
        const response = exams.map(exam => ({
            id: exam._id,
            examName: exam.examName,
            classId: exam.classId?._id,
            className: exam.classId?.name,
            classSection: exam.classId?.section,
            year: exam.classId?.year,
            semester: exam.classId?.semester,
            facultyId: exam.facultyId?._id,
            facultyName: exam.facultyId ? `${exam.facultyId.firstName} ${exam.facultyId.lastName}` : 'N/A',
            subject: exam.subject,
            maxMarks: exam.maxMarks,
            minMarks: exam.minMarks,
            examDate: exam.examDate,
            duration: exam.duration,
            description: exam.description,
            isActive: exam.isActive,
            createdAt: exam.createdAt
        }));

        res.json(response);
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single exam
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('classId', 'name section year semester')
            .populate('facultyId', 'firstName lastName');

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authMiddleware, roleMiddleware('admin', 'hod'), async (req, res) => {
    try {
        const {
            examName,
            classId,
            facultyId,
            subject,
            maxMarks,
            minMarks,
            examDate,
            duration,
            description
        } = req.body;

        // Validation
        if (!examName || !classId || !facultyId || !subject || !maxMarks || !minMarks || !examDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (minMarks >= maxMarks) {
            return res.status(400).json({ error: 'Minimum marks must be less than maximum marks' });
        }

        // Verify class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Verify faculty exists
        const facultyExists = await Faculty.findById(facultyId);
        if (!facultyExists) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const newExam = await Exam.create({
            examName,
            classId,
            facultyId,
            subject,
            maxMarks,
            minMarks,
            examDate,
            duration,
            description
        });

        res.status(201).json({
            message: 'Exam created successfully',
            id: newExam._id
        });

    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

router.put('/:id', authMiddleware, roleMiddleware('admin', 'hod'), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        const {
            examName,
            classId,
            facultyId,
            subject,
            maxMarks,
            minMarks,
            examDate,
            duration,
            description,
            isActive
        } = req.body;

        if (minMarks && maxMarks && minMarks >= maxMarks) {
            return res.status(400).json({ error: 'Minimum marks must be less than maximum marks' });
        }

        // Update fields
        if (examName) exam.examName = examName;
        if (classId) exam.classId = classId;
        if (facultyId) exam.facultyId = facultyId;
        if (subject) exam.subject = subject;
        if (maxMarks) exam.maxMarks = maxMarks;
        if (minMarks !== undefined) exam.minMarks = minMarks;
        if (examDate) exam.examDate = examDate;
        if (duration !== undefined) exam.duration = duration;
        if (description !== undefined) exam.description = description;
        if (isActive !== undefined) exam.isActive = isActive;

        await exam.save();

        res.json({ message: 'Exam updated successfully' });

    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Delete exam
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({ message: 'Exam deleted successfully' });

    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
