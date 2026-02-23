import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "CSE 3A"
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    department: { type: String, default: 'CSE' },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    roomNumber: String,
    createdAt: { type: Date, default: Date.now }
});

const Class = mongoose.model('Class', classSchema);
export default Class;
