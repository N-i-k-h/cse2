import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'hod', 'staff', 'student'], required: true },
    department: { type: String, default: 'CSE' }, // Simply storing dept name or ID
    profileId: { type: mongoose.Schema.Types.ObjectId, refPath: 'roleModel' }, // Link to Student/Faculty profile
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Virtual/Helper to know which model profileId refers to
userSchema.virtual('roleModel').get(function () {
    if (this.role === 'student') return 'Student';
    if (this.role === 'staff' || this.role === 'hod') return 'Faculty';
    return null;
});

const User = mongoose.model('User', userSchema);
export default User;
