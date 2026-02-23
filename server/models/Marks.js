import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true },
    examType: { type: String, enum: ['midterm', 'lab', 'assignment', 'final'], required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    examDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const Marks = mongoose.model('Marks', marksSchema);
export default Marks;
