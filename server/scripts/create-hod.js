import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    department: String,
    isActive: Boolean,
    createdAt: Date
});

const facultySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    lastName: String,
    name: String,
    email: String,
    designation: String,
    department: String,
    phone: String,
    education: {
        highestDegree: String,
        experience: Number
    },
    subjects: [String]
});

const User = mongoose.model('User', userSchema);
const Faculty = mongoose.model('Faculty', facultySchema);

async function createHOD() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const hodEmail = 'hod@cse';
        const hodPassword = '123';

        // Check if HOD already exists
        const existing = await User.findOne({ email: hodEmail });

        if (existing) {
            console.log('⚠️  HOD user already exists!');
            console.log('📧 Email: hod@cse');
            console.log('🔒 Password: 123');
            console.log('\nDeleting existing user and recreating...\n');

            // Delete existing user and faculty profile
            await Faculty.deleteOne({ user: existing._id });
            await User.deleteOne({ _id: existing._id });
            console.log('✅ Deleted existing HOD user\n');
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(hodPassword, salt);

        // Create User
        console.log('👤 Creating HOD user...');
        const newUser = await User.create({
            email: hodEmail,
            password: hashedPassword,
            role: 'hod',
            department: 'CSE',
            isActive: true,
            createdAt: new Date()
        });

        console.log('✅ HOD User created!');

        // Create Faculty profile
        console.log('📋 Creating HOD faculty profile...');
        await Faculty.create({
            user: newUser._id,
            firstName: 'HOD',
            lastName: 'CSE',
            name: 'HOD CSE',
            email: hodEmail,
            designation: 'Head of Department',
            department: 'Computer Science Engineering',
            phone: '9876543210',
            education: {
                highestDegree: 'PhD',
                experience: 15
            },
            subjects: []
        });

        console.log('✅ HOD Faculty profile created!\n');

        console.log('═'.repeat(60));
        console.log('🎉 HOD ACCOUNT CREATED SUCCESSFULLY!');
        console.log('═'.repeat(60));
        console.log('\n📋 LOGIN CREDENTIALS:\n');
        console.log('   📧 Email:    hod@cse');
        console.log('   🔒 Password: 123');
        console.log('   🎯 Role:     HOD');
        console.log('   🏢 Dept:     CSE');
        console.log('\n🌐 Login URL: http://localhost:5173/login');
        console.log('📍 After login, you will be redirected to: /hod');
        console.log('═'.repeat(60));

        await mongoose.disconnect();
        console.log('\n✅ Done! You can now login with these credentials.\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

createHOD();
