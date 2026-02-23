import express from 'express';
import Class from '../models/Class.js';
import Timetable from '../models/Timetable.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { sendClassAssignmentEmail } from '../services/emailService.js';

const router = express.Router();

// ── Get All Timetable Entries ────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const timetable = await Timetable.find()
            .populate('classId', 'name section year semester')
            .populate('facultyId', 'firstName lastName');

        const response = timetable.map(t => ({
            id: t._id,
            day: t.day,
            period: t.period,
            subject: t.subject,
            facultyId: t.facultyId?._id,
            facultyName: t.facultyId ? `${t.facultyId.firstName} ${t.facultyId.lastName}` : 'Unassigned',
            classId: t.classId?._id,
            className: t.classId?.name,
            section: t.classId?.section,
            roomNumber: t.roomNumber
        }));

        res.json(response);
    } catch (error) {
        console.error('Get all timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Get Timetable for Faculty ────────────────────────────────────────────────
router.get('/faculty/:facultyId', authMiddleware, async (req, res) => {
    try {
        const { facultyId } = req.params;
        const timetable = await Timetable.find({ facultyId }).populate('classId', 'name section');

        const response = timetable.map(t => ({
            day_of_week: t.day,
            period_number: t.period,
            subject: t.subject,
            faculty_id: t.facultyId,
            room_number: t.roomNumber,
            class_id: t.classId?._id,
            class_name: t.classId?.name,
            section: t.classId?.section
        }));

        res.json(response);
    } catch (error) {
        console.error('Get faculty timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Get Timetable for Class (Student View) ───────────────────────────────────
router.get('/class/:classId', authMiddleware, async (req, res) => {
    try {
        const { classId } = req.params;
        const timetable = await Timetable.find({ classId }).populate('facultyId', 'firstName lastName');

        const response = timetable.map(t => ({
            day_of_week: t.day,
            period_number: t.period,
            subject: t.subject,
            faculty_id: t.facultyId?._id,
            faculty_name: t.facultyId ? `${t.facultyId.firstName} ${t.facultyId.lastName}` : 'Unknown',
            room_number: t.roomNumber,
            class_id: t.classId
        }));

        res.json(response);
    } catch (error) {
        console.error('Get class timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── Create / Update Timetable Entry ─────────────────────────────────────────
router.post('/', authMiddleware, roleMiddleware('admin', 'hod'), async (req, res) => {
    console.log('📅 Timetable POST request body:', req.body);
    try {
        const { class_id, day_of_week, period_number, subject, faculty_id, room_number } = req.body;

        const fid = (faculty_id && faculty_id !== '') ? faculty_id : null;
        console.log(`🔍 Processing fid: ${fid} (Type: ${typeof faculty_id})`);

        // Check existing slot
        const existing = await Timetable.findOne({
            classId: class_id,
            day: day_of_week,
            period: period_number
        });

        const prevFacultyId = existing?.facultyId?.toString();
        let isUpdate = false;

        if (existing) {
            existing.subject = subject;
            existing.facultyId = fid;
            existing.roomNumber = room_number;
            await existing.save();
            isUpdate = true;
        } else {
            await Timetable.create({
                classId: class_id,
                day: day_of_week,
                period: period_number,
                subject,
                facultyId: fid,
                roomNumber: room_number
            });
        }

        // ── Send email to assigned faculty ────────────────────────────────
        let emailStatus = 'no_faculty';
        if (fid) {
            const newFacultyId = fid.toString();
            console.log(`📧 Attempting to notify faculty: ${newFacultyId}`);
            try {
                const faculty = await Faculty.findById(newFacultyId).populate('user', 'email');
                const classInfo = await Class.findById(class_id);

                console.log('📬 Faculty for notification:', faculty ? { id: faculty._id, name: faculty.firstName, hasUser: !!faculty.user, email: faculty.user?.email } : 'NOT FOUND');

                if (faculty?.user?.email) {
                    console.log(`📬 Sending class assignment email to: ${faculty.user.email}`);
                    await sendClassAssignmentEmail({
                        facultyEmail: faculty.user.email,
                        facultyName: `${faculty.firstName} ${faculty.lastName}`,
                        subject,
                        day: day_of_week,
                        period: period_number,
                        className: classInfo?.name || '',
                        semester: classInfo?.semester || '',
                        yearOfStudy: classInfo?.year || '',
                        section: classInfo?.section || '',
                        roomNumber: room_number || '',
                        isUpdate: isUpdate && prevFacultyId === newFacultyId
                    });
                    console.log(`✅ Class assignment email sent to faculty: ${faculty.user.email}`);
                    emailStatus = 'sent';
                } else {
                    console.warn(`⚠️ Could not find email for faculty: ${newFacultyId}`);
                    emailStatus = 'no_email';
                }
            } catch (emailErr) {
                console.error('❌ Error sending class assignment email:', emailErr.message);
                emailStatus = 'error';
                import('fs').then(fs => {
                    fs.appendFileSync('email_errors.log', `${new Date().toISOString()} - ${emailErr.message}\n`);
                }).catch(() => { });
            }
        }

        res.status(isUpdate ? 200 : 201).json({
            message: isUpdate ? 'Timetable updated' : 'Timetable entry created',
            emailStatus
        });

    } catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// ── Delete Timetable Entry ────────────────────────────────────────────────
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'hod'), async (req, res) => {
    try {
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
