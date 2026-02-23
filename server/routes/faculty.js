import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all faculty
router.get('/', async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('user', 'email role');
        const response = faculty.map(f => ({
            id: f._id,
            facultyId: f.facultyId,
            name: `${f.firstName} ${f.lastName}`,
            firstName: f.firstName,
            lastName: f.lastName,
            email: f.user ? f.user.email : 'N/A',
            role: f.user ? f.user.role : 'staff',
            designation: f.designation,
            department: 'CSE',
            experienceTotal: f.education?.experience || 0,
            experienceResearch: 0,
            highestDegree: f.education?.highestDegree,
            phone: f.phone,
            subjects: f.subjects || []
        }));
        res.json(response);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Faculty
// Password is auto-set to the Faculty ID (hashed)
// Login: use Faculty ID as both identifier and password
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        console.log('📝 Faculty create request:', req.body);
        const { firstName, lastName, email, phone, designation, highestDegree, experienceTotal, role, facultyId } = req.body;

        if (!facultyId) {
            return res.status(400).json({ error: 'Faculty ID is required' });
        }
        if (!firstName || !lastName || !email || !designation) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check duplicate email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Check duplicate Faculty ID
        const idExists = await Faculty.findOne({ facultyId: facultyId.toUpperCase() });
        if (idExists) {
            return res.status(400).json({ error: 'Faculty ID already exists' });
        }

        // ── HOD is UNIQUE: only one HOD allowed ──
        const userRole = role === 'hod' ? 'hod' : 'staff';
        if (userRole === 'hod') {
            const existingHOD = await User.findOne({ role: 'hod' });
            if (existingHOD) {
                return res.status(400).json({
                    error: 'An HOD already exists. Only one HOD is allowed. Please delete the existing HOD before assigning a new one.'
                });
            }
        }

        // Auto-set password = Faculty ID (uppercased + hashed)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(facultyId.toUpperCase(), salt);

        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: userRole,
            department: 'CSE'
        });

        const newFaculty = await Faculty.create({
            user: newUser._id,
            facultyId: facultyId.toUpperCase(),
            firstName,
            lastName,
            designation,
            phone,
            education: {
                highestDegree: highestDegree || 'M.Tech',
                experience: experienceTotal || 0
            },
            subjects: []
        });

        console.log('✅ Faculty created:', newFaculty.facultyId);
        res.status(201).json({
            message: 'Faculty created successfully',
            id: newFaculty._id,
            facultyId: newFaculty.facultyId
        });

    } catch (error) {
        console.error('Create faculty error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Update Faculty
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, designation, phone, highestDegree, experienceTotal } = req.body;
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        // Update User if email changed
        if (email && faculty.user) {
            await User.findByIdAndUpdate(faculty.user, {
                name: `${firstName || faculty.firstName} ${lastName || faculty.lastName}`,
                email
            });
        }

        // Update Faculty
        faculty.firstName = firstName || faculty.firstName;
        faculty.lastName = lastName || faculty.lastName;
        faculty.designation = designation || faculty.designation;
        faculty.phone = phone || faculty.phone;
        if (faculty.education) {
            faculty.education.highestDegree = highestDegree || faculty.education.highestDegree;
            faculty.education.experience = experienceTotal || faculty.education.experience;
        }

        await faculty.save();
        res.json({ message: 'Faculty updated successfully' });
    } catch (error) {
        console.error('Update faculty error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Faculty Password
router.put('/:id/password', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const { newPassword } = req.body;
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(faculty.user, { password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Faculty
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        await User.findByIdAndDelete(faculty.user);
        await Faculty.findByIdAndDelete(faculty._id);

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
