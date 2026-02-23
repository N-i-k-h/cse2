import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    department: String,
    isActive: Boolean,
    createdAt: Date
});

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rollNumber: String,
    registerNumber: String,
    semester: Number,
    section: String,
    batch: String,
    parentName: String,
    parentPhone: String,
    parentEmail: String,
    address: String
});

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);

async function createStudent() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const email = 'student@siet.edu';
        const password = 'student123';

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} already exists. Updating password...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await user.save();
            console.log(`✅ Password updated to: ${password}`);
        } else {
            console.log(`Creating new user ${email}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name: 'Test Student',
                email: email,
                password: hashedPassword,
                role: 'student',
                department: 'CSE',
                isActive: true,
                createdAt: new Date()
            });
            console.log(`✅ User created`);
        }

        // Check/Create Student Profile
        let studentProfile = await Student.findOne({ user: user._id });
        if (!studentProfile) {
            await Student.create({
                user: user._id,
                rollNumber: 'CSE001',
                registerNumber: '4SI22CS001',
                semester: 5,
                section: 'A',
                batch: '2022-2026',
                parentName: 'Parent Name',
                parentPhone: '9999999999',
                parentEmail: 'parent@siet.edu',
                address: 'Test Address'
            });
            console.log(`✅ Student profile created`);
        } else {
            console.log(`ℹ️ Student profile already exists`);
        }

        console.log('\nStudent Logic Ready:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
    }
}

createStudent();
