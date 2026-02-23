
import whatsappService from './services/whatsappService.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const targetNumber = process.argv[2];

if (!targetNumber) {
    console.log('Usage: node test-whatsapp-direct.js <phone_number_with_country_code>');
    console.log('Example: node test-whatsapp-direct.js +919876543210');
    process.exit(1);
}

async function sendTest() {
    console.log(`Sending test message to: ${targetNumber}`);

    try {
        const result = await whatsappService.sendMessage(targetNumber, '🔔 This is a test message from your SIET CSE ERP System! If you see this, Twilio is working correctly. 🚀');

        if (result.success || result.sid) {
            console.log('✅ Message sent successfully!');
            console.log('SID:', result.messageId || result.sid);
        } else {
            console.log('❌ Message failed.');
            console.log('Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

sendTest();
