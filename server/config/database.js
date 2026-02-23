import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Seed Admin User
        const adminExists = await User.findOne({ email: 'admin@cse' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                name: 'System Admin',
                email: 'admin@cse',
                password: hashedPassword,
                role: 'admin',
                department: 'CSE'
            });
            console.log('👤 Admin user seeded successfully');
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
