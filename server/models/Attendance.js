import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' }, // Optional link to slot
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Using compound index for uniqueness (one status per student per day per slot?)
// Or per day per class?
// Schema.sql had `unique_attendance (student_id, timetable_id, date)`
attendanceSchema.index({ studentId: 1, timetableId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
