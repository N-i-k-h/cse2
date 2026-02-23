import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ email: /nikhil/i });
    console.log(JSON.stringify(users.map(u => ({ id: u._id, email: u.email, name: u.name })), null, 2));
    await mongoose.disconnect();
}
check();
