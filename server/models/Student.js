import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usn: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }, // Keeping consistent with SQL schema thought
    phone: String,
    parentName: String,
    parentPhone: String,
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // Link to Class model
    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
