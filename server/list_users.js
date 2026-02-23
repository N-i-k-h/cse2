import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find();
    console.log(users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role
    })));
    await mongoose.disconnect();
}

listUsers();
