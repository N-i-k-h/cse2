import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    department: String
});

const User = mongoose.model('User', userSchema);

async function listAllUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({}).select('name email role');

        let output = '';
        output += '📋 All Users in Database:\n';
        output += '═'.repeat(80) + '\n';

        users.forEach((user, index) => {
            output += `${index + 1}. ${user.name}\n`;
            output += `   Email: ${user.email}\n`;
            output += `   Role: ${user.role}\n`;
            output += '─'.repeat(80) + '\n';
        });

        output += `\nTotal Users: ${users.length}\n`;

        fs.writeFileSync('users.txt', output);
        console.log('Users written to users.txt');

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error for list users:', error);
        await mongoose.disconnect();
    }
}

listAllUsers();
