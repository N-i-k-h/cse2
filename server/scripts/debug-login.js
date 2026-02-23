import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    department: String
});

const User = mongoose.model('User', userSchema);

async function debugLogin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // Find the user
        const email = 'nk@gmail.com';
        const password = '123';

        console.log(`Looking for user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User NOT FOUND in database!');
            console.log('\n📋 All users in database:');
            const allUsers = await User.find({}).select('name email role');
            allUsers.forEach(u => {
                console.log(`  - ${u.email} (${u.role})`);
            });
        } else {
            console.log('✅ User FOUND!');
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);

            // Test password
            console.log(`\nTesting password: "${password}"`);
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                console.log('✅ PASSWORD MATCHES! Login should work.');
            } else {
                console.log('❌ PASSWORD DOES NOT MATCH!');
                console.log('\nTrying default password "staff123"...');
                const isDefaultMatch = await bcrypt.compare('staff123', user.password);
                if (isDefaultMatch) {
                    console.log('✅ Default password "staff123" WORKS!');
                } else {
                    console.log('❌ Default password also does not match.');
                }
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

debugLogin();
