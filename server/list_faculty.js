import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import fs from 'fs';

dotenv.config();

async function listFaculty() {
    await mongoose.connect(process.env.MONGO_URI);
    const faculty = await Faculty.find().populate('user');
    const results = faculty.map(f => ({
        fid: f.facultyId,
        firstName: f.firstName,
        lastName: f.lastName,
        userEmail: f.user?.email,
        userId: f.user?._id
    }));
    fs.writeFileSync('faculty_debug.json', JSON.stringify(results, null, 2));
    await mongoose.disconnect();
}

listFaculty();
