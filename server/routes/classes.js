import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all classes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find().populate('classTeacher', 'firstName lastName');

        // Get student counts for each class
        const response = await Promise.all(
            classes.map(async (c) => {
                // Try to count by classId first, then fallback to year/semester/section
                let studentCount = await Student.countDocuments({ classId: c._id });

                if (studentCount === 0) {
                    studentCount = await Student.countDocuments({
                        year: c.year,
                        semester: c.semester,
                        section: c.section
                    });
                }

                return {
                    id: c._id,
                    name: c.name,
                    year: c.year,
                    semester: c.semester,
                    section: c.section,
                    roomNumber: c.roomNumber,
                    classTeacherId: c.classTeacher?._id,
                    student_count: studentCount,
                    class_teacher_name: c.classTeacher ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}` : 'Unassigned'
                };
            })
        );

        res.json(response);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Class
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { name, year, semester, section, class_teacher_id, room_number } = req.body;

        const newClass = await Class.create({
            name,
            year,
            semester,
            section,
            classTeacher: class_teacher_id,
            roomNumber: room_number
        });

        res.status(201).json({ id: newClass._id, message: 'Class created' });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Class
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
