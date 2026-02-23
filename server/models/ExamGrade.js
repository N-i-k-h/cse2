import mongoose from 'mongoose';

const examGradeSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    marksObtained: { type: Number, required: true },
    remarks: { type: String },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    gradedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one grade per student per exam
examGradeSchema.index({ examId: 1, studentId: 1 }, { unique: true });

const ExamGrade = mongoose.model('ExamGrade', examGradeSchema);
export default ExamGrade;
