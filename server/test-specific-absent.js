
import whatsappService from './services/whatsappService.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: join(__dirname, '.env') });

const numbers = ['+918618593300', '+919380371641'];
const date = new Date().toLocaleDateString('en-IN');

// Construct the Absent message format
const message = `
🎓 *SIET CSE - Attendance Alert*

Dear Parent,

Student: Test Student
Class: Testing Class
Date: ${date}
Status: ABSENT

⚠️ Your ward was marked ABSENT today.

For any queries, please contact the class teacher.

- SIET, Dept of CSE
`.trim();

async function sendTestMessages() {
    console.log('--- Starting Test Send ---');
    console.log('Provider:', process.env.WHATSAPP_PROVIDER || 'default');

    for (const number of numbers) {
        console.log(`\nSending "Absent" message to: ${number}`);
        try {
            const result = await whatsappService.sendMessage(number, message);
            console.log('Result:', JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('❌ Failed:', error.message);
        }
    }
    console.log('\n--- Test Complete ---');
}

sendTestMessages();
