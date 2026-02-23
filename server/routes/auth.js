import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Login
// Supports two modes:
//   - Student: { usn, password }  → looks up user via Student.usn → User
//   - Others:  { email, password } → looks up User by email
router.post('/login', async (req, res) => {
    try {
        const { email, password, usn, facultyId } = req.body;

        let user = null;
        let profile = null;

        if (usn) {
            // ── STUDENT LOGIN (USN) ──
            console.log('🔐 Student login attempt with USN:', usn);
            const student = await Student.findOne({ usn: usn.toUpperCase() }).populate('user');
            if (!student || !student.user) {
                console.log('❌ Student not found for USN:', usn);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            user = student.user;
            profile = student;
            console.log('✅ Student found:', user.email);

        } else if (facultyId) {
            // ── FACULTY / HOD LOGIN (Faculty ID) ──
            console.log('🔐 Faculty login attempt with Faculty ID:', facultyId);
            const facultyRecord = await Faculty.findOne({ facultyId: facultyId.toUpperCase() }).populate('user');
            if (!facultyRecord || !facultyRecord.user) {
                console.log('❌ Faculty not found for ID:', facultyId);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            user = facultyRecord.user;
            profile = facultyRecord;
            console.log('✅ Faculty found:', user.email, 'Role:', user.role);

        } else {
            // ── EMAIL LOGIN (admin / hod / staff) ──
            if (!email) {
                return res.status(400).json({ error: 'Email or USN is required' });
            }
            console.log('🔐 Login attempt:', email);
            user = await User.findOne({ email });
            if (!user) {
                console.log('❌ User not found:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            console.log('✅ User found:', user.email, 'Role:', user.role);

            if (user.role === 'staff' || user.role === 'hod') {
                profile = await Faculty.findOne({ user: user._id });
                console.log('👤 Faculty profile found:', profile ? 'Yes' : 'No');
            }
        }

        // Verify password
        console.log('🔑 Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔑 Password match result:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch for:', user.email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('✅ Password verified for:', user.email);

        // Create token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('🎫 Token created for:', user.email, 'Role:', user.role);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                profileId: profile ? profile._id : null
            }
        });

        console.log('✅ Login successful for:', user.email);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
