import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    designation: { type: String, required: true },
    phone: String,
    education: {
        highestDegree: String,
        experience: Number
    },
    subjects: [String],
    createdAt: { type: Date, default: Date.now }
});

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;
