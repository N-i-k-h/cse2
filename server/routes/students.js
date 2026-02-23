import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';
import Timetable from '../models/Timetable.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all students (with filters)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { year, semester, section } = req.query;
        let query = {};

        if (year) query.year = year;
        if (semester) query.semester = semester;
        if (section) query.section = section;

        const students = await Student.find(query).populate('user', 'email');

        const response = students.map(s => ({
            id: s._id,
            name: `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.user ? s.user.email : 'N/A', // Assuming populate works
            usn: s.usn,
            year: s.year,
            semester: s.semester,
            section: s.section,
            phone: s.phone,
            parentName: s.parentName,
            parentPhone: s.parentPhone
        }));

        res.json(response);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'email');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const response = {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.user ? student.user.email : 'N/A',
            usn: student.usn,
            year: student.year,
            semester: student.semester,
            section: student.section,
            phone: student.phone,
            parentName: student.parentName,
            parentPhone: student.parentPhone
        };

        res.json(response);
    } catch (error) {
        console.error('Get student by ID error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /students/:id/report — full attendance + marks report
router.get('/:id/report', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'email');
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // 1. Fetch all attendance records for this student
        const attendanceRecords = await Attendance.find({ studentId: req.params.id })
            .populate({
                path: 'timetableId',
                populate: { path: 'facultyId', select: 'firstName lastName' }
            });

        // Build subject-wise attendance map
        const subjectMap = {}; // { subject: { present: n, total: n, faculty: string } }
        for (const rec of attendanceRecords) {
            let subject = 'General';
            let facultyName = 'Unknown';

            if (rec.timetableId) {
                if (rec.timetableId.subject) subject = rec.timetableId.subject;
                if (rec.timetableId.facultyId) {
                    facultyName = `${rec.timetableId.facultyId.firstName} ${rec.timetableId.facultyId.lastName}`;
                }
            }

            if (!subjectMap[subject]) subjectMap[subject] = { present: 0, total: 0, faculty: facultyName };
            subjectMap[subject].total++;
            if (rec.status === 'present') subjectMap[subject].present++;
        }

        const subjectAttendance = Object.entries(subjectMap).map(([subject, data]) => ({
            subject,
            faculty: data.faculty,
            present: data.present,
            total: data.total,
            percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
        }));

        const totalPresent = attendanceRecords.filter(r => r.status === 'present').length;
        const totalClasses = attendanceRecords.length;
        const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

        // 2. Fetch marks
        const marksRecords = await Marks.find({ studentId: req.params.id }).sort({ examDate: -1 });

        // Group marks by subject then examType
        const marksMap = {}; // { subject: { examType: { obtained, max } } }
        for (const m of marksRecords) {
            if (!marksMap[m.subject]) marksMap[m.subject] = {};
            marksMap[m.subject][m.examType] = {
                obtained: m.marksObtained,
                max: m.maxMarks,
                date: m.examDate
            };
        }

        const subjectMarks = Object.entries(marksMap).map(([subject, types]) => ({
            subject,
            exams: Object.entries(types).map(([type, data]) => ({
                type,
                obtained: data.obtained,
                max: data.max,
                percentage: Math.round((data.obtained / data.max) * 100),
                date: data.date
            }))
        }));

        res.json({
            student: {
                id: student._id,
                name: `${student.firstName} ${student.lastName}`,
                usn: student.usn,
                email: student.user?.email,
                year: student.year,
                semester: student.semester,
                section: student.section,
                phone: student.phone,
                parentName: student.parentName,
                parentPhone: student.parentPhone
            },
            attendance: {
                totalClasses,
                totalPresent,
                totalAbsent: totalClasses - totalPresent,
                overallPercentage,
                subjectWise: subjectAttendance
            },
            marks: {
                subjectWise: subjectMarks
            }
        });
    } catch (error) {
        console.error('Student report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Student
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { firstName, lastName, email, usn, phone, parentName, parentPhone, year, semester, section, classId } = req.body;

        console.log('📝 Creating student:', { firstName, lastName, email, usn, year, semester, section, classId });

        // Validate required fields
        if (!firstName || !lastName || !email || !usn || !year || !semester || !section) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check duplicates
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('❌ Email already exists:', email);
            return res.status(400).json({ error: 'Email already exists' });
        }

        const usnExists = await Student.findOne({ usn: usn.toUpperCase() });
        if (usnExists) {
            console.log('❌ USN already exists:', usn);
            return res.status(400).json({ error: 'USN already exists' });
        }

        // Create User — password is the USN by default
        console.log('🔐 Hashing USN as password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(usn.toUpperCase(), salt);

        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: 'student',
            department: 'CSE'
        });

        console.log('✅ User created:', newUser._id);

        const studentData = {
            user: newUser._id,
            usn: usn.toUpperCase(),
            firstName,
            lastName,
            phone: phone || '',
            parentName: parentName || '',
            parentPhone: parentPhone || '',
            year: Number(year),
            semester: Number(semester),
            section: section.toUpperCase()
        };

        // Add classId if provided
        if (classId) {
            studentData.classId = classId;
            console.log('✅ ClassId provided:', classId);
        } else {
            console.log('⚠️ No classId provided - student will not be linked to a class');
        }

        console.log('📋 Final student data:', studentData);

        const newStudent = await Student.create(studentData);

        console.log('✅ Student created:', newStudent._id);

        res.status(201).json({
            message: 'Student created successfully',
            id: newStudent._id
        });

    } catch (error) {
        console.error('❌ Create student error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Update Student
router.put('/:id', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { firstName, lastName, email, year, semester, section, phone, parentName, parentPhone, classId } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Update User if email changed
        if (email && student.user) {
            await User.findByIdAndUpdate(student.user, {
                name: `${firstName || student.firstName} ${lastName || student.lastName}`,
                email
            });
        }

        // Update Student
        student.firstName = firstName || student.firstName;
        student.lastName = lastName || student.lastName;
        student.year = year !== undefined ? Number(year) : student.year;
        student.semester = semester !== undefined ? Number(semester) : student.semester;
        student.section = section || student.section;
        student.phone = phone || student.phone;
        student.parentName = parentName || student.parentName;
        student.parentPhone = parentPhone || student.parentPhone;
        if (classId) student.classId = classId;

        await student.save();
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Student
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(student._id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
