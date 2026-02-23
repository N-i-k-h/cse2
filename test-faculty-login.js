const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './server/.env' });

const userSchema = new mongoose.Schema({
    name: String,
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
    designation: String,
    phone: String,
    education: {
        highestDegree: String,
        experience: Number
    },
    subjects: [String]
});

const User = mongoose.model('User', userSchema);
const Faculty = mongoose.model('Faculty', facultySchema);

async function createTestFaculty() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if test faculty already exists
        const existingUser = await User.findOne({ email: 'test.faculty@siet.edu' });

        if (existingUser) {
            console.log('⚠️  Test faculty already exists');
            console.log('Email: test.faculty@siet.edu');
            console.log('Password: faculty123');
            console.log('Role:', existingUser.role);

            // Verify password
            const isMatch = await bcrypt.compare('faculty123', existingUser.password);
            console.log('Password verification:', isMatch ? '✅ Correct' : '❌ Incorrect');

            await mongoose.disconnect();
            return;
        }

        // Create new test faculty
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('faculty123', salt);

        const newUser = await User.create({
            name: 'Test Faculty',
            email: 'test.faculty@siet.edu',
            password: hashedPassword,
            role: 'staff',
            department: 'CSE',
            isActive: true,
            createdAt: new Date()
        });

        console.log('✅ Created User account');

        const newFaculty = await Faculty.create({
            user: newUser._id,
            firstName: 'Test',
            lastName: 'Faculty',
            designation: 'Assistant Professor',
            phone: '9876543210',
            education: {
                highestDegree: 'M.Tech',
                experience: 5
            },
            subjects: ['Data Structures', 'Algorithms']
        });

        console.log('✅ Created Faculty profile');
        console.log('\n📋 Test Faculty Credentials:');
        console.log('Email: test.faculty@siet.edu');
        console.log('Password: faculty123');
        console.log('Role: staff');
        console.log('\n🎯 Expected redirect: /staff/dashboard');

        await mongoose.disconnect();
        console.log('\n✅ Done! You can now login with these credentials.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

createTestFaculty();
