import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    examName: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    minMarks: { type: Number, required: true },
    examDate: { type: Date, required: true },
    duration: { type: Number }, // in minutes
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
