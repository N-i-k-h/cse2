import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// MongoDB URI from your .env file
const MONGODB_URI = 'mongodb+srv://nikhilkashyapkn_db_user:aks@cluster0.s6cebfe.mongodb.net/siet_cse_erp?retryWrites=true&w=majority&appName=Cluster0';

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

async function createTestUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test credentials to create
        const testUsers = [
            {
                email: 'admin@siet.edu',
                password: 'admin123',
                name: 'Super Admin',
                role: 'admin',
                department: 'CSE'
            },
            {
                email: 'faculty@siet.edu',
                password: 'faculty123',
                name: 'Test Faculty',
                role: 'staff',
                department: 'CSE',
                firstName: 'Test',
                lastName: 'Faculty',
                designation: 'Assistant Professor',
                phone: '9876543210',
                education: {
                    highestDegree: 'M.Tech',
                    experience: 5
                }
            },
            {
                email: 'hod@siet.edu',
                password: 'hod123',
                name: 'HOD CSE',
                role: 'hod',
                department: 'CSE',
                firstName: 'HOD',
                lastName: 'CSE',
                designation: 'HOD',
                phone: '9876543211',
                education: {
                    highestDegree: 'PhD',
                    experience: 15
                }
            }
        ];

        console.log('Creating test users...\n');
        console.log('═'.repeat(80));

        for (const testUser of testUsers) {
            // Check if user already exists
            const existing = await User.findOne({ email: testUser.email });

            if (existing) {
                console.log(`⚠️  User already exists: ${testUser.email}`);
                console.log(`   Try password: ${testUser.password}`);
                console.log('─'.repeat(80));
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testUser.password, salt);

            // Create User
            const newUser = await User.create({
                name: testUser.name,
                email: testUser.email,
                password: hashedPassword,
                role: testUser.role,
                department: testUser.department,
                isActive: true,
                createdAt: new Date()
            });

            console.log(`✅ Created User: ${testUser.email}`);
            console.log(`   Password: ${testUser.password}`);
            console.log(`   Role: ${testUser.role}`);

            // Create Faculty profile if needed
            if (testUser.role === 'staff' || testUser.role === 'hod') {
                await Faculty.create({
                    user: newUser._id,
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    designation: testUser.designation,
                    phone: testUser.phone,
                    education: testUser.education,
                    subjects: []
                });
                console.log(`   ✅ Faculty profile created`);
            }

            console.log('─'.repeat(80));
        }

        console.log('\n📋 TEST CREDENTIALS SUMMARY:\n');
        console.log('═'.repeat(80));
        console.log('1. ADMIN LOGIN:');
        console.log('   Email: admin@siet.edu');
        console.log('   Password: admin123');
        console.log('   Expected Route: /admin\n');

        console.log('2. FACULTY LOGIN:');
        console.log('   Email: faculty@siet.edu');
        console.log('   Password: faculty123');
        console.log('   Expected Route: /staff/dashboard\n');

        console.log('3. HOD LOGIN:');
        console.log('   Email: hod@siet.edu');
        console.log('   Password: hod123');
        console.log('   Expected Route: /hod\n');
        console.log('═'.repeat(80));

        await mongoose.disconnect();
        console.log('\n✅ Done! You can now test login with these credentials.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

createTestUsers();
