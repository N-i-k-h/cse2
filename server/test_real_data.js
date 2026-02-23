import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Class from './models/Class.js';
import { sendClassAssignmentEmail } from './services/emailService.js';

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');

    // Find the faculty you are probably using (Nikhil N)
    const faculty = await Faculty.findOne({ facultyId: '2222' }).populate('user');
    const classInfo = await Class.findOne();

    if (faculty && faculty.user) {
        console.log('Target Email:', faculty.user.email);
        try {
            const res = await sendClassAssignmentEmail({
                facultyEmail: faculty.user.email,
                facultyName: `${faculty.firstName} ${faculty.lastName}`,
                subject: 'Test REAL Logic',
                day: 'Monday',
                period: 1,
                className: classInfo?.name || 'Test Class',
                semester: classInfo?.semester || '1',
                yearOfStudy: classInfo?.year || '1',
                section: classInfo?.section || 'A',
                roomNumber: '101',
                isUpdate: false
            });
            console.log('RESULT:', JSON.stringify(res));
        } catch (e) {
            console.error('ERROR:', e.message);
        }
    } else {
        console.log('Faculty not found');
    }

    await mongoose.disconnect();
}

test();
