import mongoose from 'mongoose';
import whatsappService from './services/whatsappService.js';
import Student from './models/Student.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function testAttendanceNotification() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find a student to test with
        const student = await Student.findOne();
        if (!student) {
            console.error('❌ No students found in database to test with.');
            return;
        }

        console.log(`\nTesting with student: ${student.firstName} ${student.lastName} (${student.usn})`);

        // Test 1: Present (Should be skipped)
        console.log('\n--- Test 1: Marking Present ---');
        const resultPresent = await whatsappService.sendAttendanceNotification(
            student._id,
            new Date(),
            'present'
        );
        console.log('Result:', resultPresent);
        if (resultPresent.skipped) {
            console.log('✅ Validation Passed: Notification was skipped for "present" status.');
        } else {
            console.error('❌ Validation Failed: Notification was NOT skipped.');
        }

        // Test 2: Absent (Should attempt to send)
        console.log('\n--- Test 2: Marking Absent ---');
        // We expect this to attempt sending. It might fail if real credentials aren't set, 
        // but it shouldn't be skipped.
        const resultAbsent = await whatsappService.sendAttendanceNotification(
            student._id,
            new Date(),
            'absent'
        );
        console.log('Result:', resultAbsent);
        if (!resultAbsent.skipped) {
            console.log('✅ Validation Passed: Notification attempted for "absent" status.');
        } else {
            console.error('❌ Validation Failed: Notification was skipped for "absent" status.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testAttendanceNotification();
