import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    day: { type: String, required: true }, // Monday, Tuesday...
    period: { type: Number, required: true }, // 1, 2, 3...
    subject: { type: String, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    roomNumber: String,
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent double booking class slot
timetableSchema.index({ classId: 1, day: 1, period: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
