import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

// Override console early
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    originalLog(...args);
    const msg = `[LOG] ${new Date().toISOString()}: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}\n`;
    try { fs.appendFileSync('server_logs.txt', msg); } catch (e) { }
};
console.error = (...args) => {
    originalError(...args);
    const msg = `[ERR] ${new Date().toISOString()}: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}\n`;
    try { fs.appendFileSync('server_logs.txt', msg); } catch (e) { }
};

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import facultyRoutes from './routes/faculty.js';
import classRoutes from './routes/classes.js';
import attendanceRoutes from './routes/attendance.js';
import marksRoutes from './routes/marks.js';
import notificationsRoutes from './routes/notifications.js';
import timetableRoutes from './routes/timetable.js';
import examRoutes from './routes/exams.js';
import examGradesRoutes from './routes/examGrades.js';
import profileRoutes from './routes/profile.js';
import adminPurgeRoutes from './routes/adminPurge.js';

import connectDB from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow Render domain or wildcard
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-grades', examGradesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminPurgeRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SIET CSE ERP Server is running' });
});

// ── Serve Frontend Static Files ─────────────────────────────────────────────
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // Any other route should serve index.html
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        } else {
            res.status(404).json({ error: 'API route not found' });
        }
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
