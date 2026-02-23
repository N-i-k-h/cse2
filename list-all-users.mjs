import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'server/.env') });

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
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://nikhilkashyapkn_db_user:aks@cluster0.s6cebfe.mongodb.net/siet_cse_erp?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({}).select('name email role');

        console.log('📋 All Users in Database:\n');
        console.log('═'.repeat(80));

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log('─'.repeat(80));
        });

        console.log(`\nTotal Users: ${users.length}\n`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

listAllUsers();
