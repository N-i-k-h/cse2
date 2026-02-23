import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let profileData = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        // Get additional profile data based on role
        if (user.role === 'staff' || user.role === 'hod') {
            const faculty = await Faculty.findOne({ user: user._id });
            if (faculty) {
                profileData = {
                    ...profileData,
                    facultyId: faculty._id,
                    firstName: faculty.firstName,
                    lastName: faculty.lastName,
                    phone: faculty.phone,
                    department: faculty.department,
                    designation: faculty.designation
                };
            }
        } else if (user.role === 'student') {
            const student = await Student.findOne({ user: user._id });
            if (student) {
                profileData = {
                    ...profileData,
                    studentId: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    usn: student.usn,
                    phone: student.phone,
                    year: student.year,
                    semester: student.semester,
                    section: student.section,
                    classId: student.classId
                };
            }
        }

        res.json(profileData);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, phone, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update email if changed
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            user.email = email;
            await user.save();
        }

        // Update role-specific profile
        if (user.role === 'staff' || user.role === 'hod') {
            const faculty = await Faculty.findOne({ user: user._id });
            if (faculty) {
                if (firstName) faculty.firstName = firstName;
                if (lastName) faculty.lastName = lastName;
                if (phone) faculty.phone = phone;
                await faculty.save();
            }
        } else if (user.role === 'student') {
            const student = await Student.findOne({ user: user._id });
            if (student) {
                if (firstName) student.firstName = firstName;
                if (lastName) student.lastName = lastName;
                if (phone) student.phone = phone;
                await student.save();
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log('✅ Password changed for user:', user.email);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
