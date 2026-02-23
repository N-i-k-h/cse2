const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    department: String
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({}).select('name email role');

        console.log('📋 All Users in Database:\n');
        console.log('═'.repeat(80));

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password: [HASHED - Try "staff123" if you didn't set a custom password]`);
            console.log('─'.repeat(80));
        });

        console.log(`\nTotal Users: ${users.length}\n`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

checkUsers();
