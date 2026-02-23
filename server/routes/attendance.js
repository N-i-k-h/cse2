import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Timetable from '../models/Timetable.js';
import Class from '../models/Class.js';
import whatsappService from '../services/whatsappService.js';
import { sendAttendanceEmail } from '../services/emailService.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ── Helper: calculate overall attendance % for a student ────────────────────
const getAttendancePct = async (studentId) => {
    const all = await Attendance.find({ studentId });
    if (!all.length) return null;
    const present = all.filter(a => a.status?.toLowerCase() === 'present').length;
    return Math.round((present / all.length) * 100);
};

// ── Helper: fire attendance email (non-blocking) ─────────────────────────────
const fireAttendanceEmail = async ({ student_id, timetable_id, date, status, markedByUserId }) => {
    const s = (status || '').toLowerCase();
    if (s !== 'absent' && s !== 'late') return; // only notify for absent / late

    try {
        const student = await Student.findById(student_id).populate('user', 'email');
        if (!student?.user?.email) {
            console.log('⚠️ No student email, skip notification');
            return;
        }

        const faculty = await Faculty.findOne({ user: markedByUserId });
        const facultyName = faculty ? `${faculty.firstName} ${faculty.lastName}` : 'Faculty';

        let subject = 'Class';
        let day = '';
        let period = '';
        let className = '';
        let semester = student.semester || '';
        let yearOfStudy = student.year || '';

        if (timetable_id) {
            const tt = await Timetable.findById(timetable_id).populate('classId', 'name section year semester');
            if (tt) {
                subject = tt.subject || subject;
                day = tt.day || '';
                period = tt.period || '';
                if (tt.classId) {
                    className = tt.classId.name || '';
                    semester = tt.classId.semester || semester;
                    yearOfStudy = tt.classId.year || yearOfStudy;
                }
            }
        }

        const attendancePct = await getAttendancePct(student_id);

        // Send email
        console.log(`📧 Firing attendance email to student: ${student.user.email} (Status: ${status})`);
        await sendAttendanceEmail({
            studentEmail: student.user.email,
            studentName: `${student.firstName} ${student.lastName}`,
            subject,
            date,
            status,
            facultyName,
            day,
            period,
            className,
            semester,
            yearOfStudy,
            attendancePct
        });
        console.log(`✅ Attendance email sent to: ${student.user.email}`);

        // Also send WhatsApp
        try {
            await whatsappService.sendAttendanceNotification(student_id, date, status);
        } catch (waErr) {
            console.error('⚠️ WhatsApp notification failed:', waErr.message);
        }

    } catch (error) {
        console.error('❌ fireAttendanceEmail error:', error.message);
        import('fs').then(fs => {
            fs.appendFileSync('email_errors.log', `${new Date().toISOString()} - fireAttendanceEmail HELPER Error: ${error.message}\n`);
        }).catch(() => { });
    }
};


// ── Mark Single Attendance ───────────────────────────────────────────────────
router.post('/mark', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { student_id, timetable_id, date, status, class_id } = req.body;

        console.log('📝 Marking attendance:', { student_id, date, status });

        let query = { studentId: student_id, date: new Date(date) };
        if (timetable_id) query.timetableId = timetable_id;

        const existing = await Attendance.findOne(query);
        if (existing) {
            existing.status = status;
            await existing.save();
        } else {
            await Attendance.create({
                studentId: student_id,
                classId: class_id,
                timetableId: timetable_id,
                date: new Date(date),
                status,
                markedBy: req.user.id
            });
        }

        // Send email (non-blocking)
        fireAttendanceEmail({
            student_id, timetable_id, date, status, markedByUserId: req.user.id
        }).catch(err => {
            console.error('Email fire error:', err);
            import('fs').then(fs => {
                fs.appendFileSync('email_errors.log', `${new Date().toISOString()} - Attendance Email Error: ${err.message}\n`);
            }).catch(() => { });
        });

        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// ── Bulk Mark Attendance ─────────────────────────────────────────────────────
router.post('/mark-bulk', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { attendance_records } = req.body;
        console.log(`📝 Bulk marking attendance for ${attendance_records.length} students`);

        const results = { success: 0, failed: 0, emailsQueued: 0 };

        for (const record of attendance_records) {
            try {
                const { student_id, date, status, timetable_id, class_id } = record;

                let query = { studentId: student_id, date: new Date(date) };
                if (timetable_id) query.timetableId = timetable_id;

                const existing = await Attendance.findOne(query);
                if (existing) {
                    existing.status = status;
                    await existing.save();
                } else {
                    await Attendance.create({
                        studentId: student_id,
                        classId: class_id,
                        timetableId: timetable_id,
                        date: new Date(date),
                        status,
                        markedBy: req.user.id
                    });
                }

                results.success++;

                // Queue email for absent / late
                const s = (status || '').toLowerCase();
                if (s === 'absent' || s === 'late') {
                    results.emailsQueued++;
                    fireAttendanceEmail({
                        student_id, timetable_id, date, status, markedByUserId: req.user.id
                    }).catch(e => console.error('Bulk email fire error:', e));
                }

            } catch (err) {
                console.error('Failed to mark attendance for:', record.student_id, err.message);
                results.failed++;
            }
        }

        console.log(`✅ Bulk done: ${results.success} marked, ${results.emailsQueued} emails queued, ${results.failed} failed`);

        res.json({ message: 'Bulk attendance marked', results });

    } catch (error) {
        console.error('Bulk mark attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
