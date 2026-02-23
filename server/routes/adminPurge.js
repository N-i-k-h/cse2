import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// DELETE EVERYTHING (admin only) — works directly with collection names
// POST /api/admin/purge/:target
router.post('/purge/:target', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { target } = req.params;
        const db = mongoose.connection.db;

        switch (target) {
            case 'students': {
                const s = await db.collection('students').deleteMany({});
                await db.collection('users').deleteMany({ role: 'student' });
                return res.json({ message: `${s.deletedCount} students deleted successfully` });
            }

            case 'faculty': {
                const f = await db.collection('faculties').deleteMany({});
                await db.collection('users').deleteMany({ role: { $in: ['staff', 'hod'] } });
                return res.json({ message: `${f.deletedCount} faculty records deleted successfully` });
            }

            case 'classes': {
                const c = await db.collection('classes').deleteMany({});
                return res.json({ message: `${c.deletedCount} classes deleted successfully` });
            }

            case 'exams': {
                const e = await db.collection('exams').deleteMany({});
                const eg = await db.collection('examgrades').deleteMany({});
                return res.json({ message: `${e.deletedCount} exams and ${eg.deletedCount} exam grades deleted` });
            }

            case 'attendance': {
                const a = await db.collection('attendances').deleteMany({});
                return res.json({ message: `${a.deletedCount} attendance records deleted` });
            }

            case 'marks': {
                const m = await db.collection('marks').deleteMany({});
                return res.json({ message: `${m.deletedCount} marks records deleted` });
            }

            case 'timetable': {
                const t = await db.collection('timetables').deleteMany({});
                return res.json({ message: `${t.deletedCount} timetable entries deleted` });
            }

            case 'all': {
                const collections = ['students', 'faculties', 'classes', 'exams', 'examgrades', 'attendances', 'marks', 'timetables'];
                let total = 0;
                for (const col of collections) {
                    try {
                        const r = await db.collection(col).deleteMany({});
                        total += r.deletedCount;
                    } catch (_) { /* collection may not exist yet */ }
                }
                const u = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
                return res.json({ message: `All data purged. ${total + u.deletedCount} total records deleted. Admin account preserved.` });
            }

            default:
                return res.status(400).json({ error: 'Unknown purge target' });
        }
    } catch (error) {
        console.error('Purge error:', error);
        res.status(500).json({ error: 'Server error during purge', details: error.message });
    }
});

export default router;
