import whatsappService from './services/whatsappService.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function testWhatsApp() {
    console.log('Testing WhatsApp integration...');
    const config = whatsappService.getConfig();
    console.log('Provider:', config.whatsapp_provider);
    console.log('SID:', config.whatsapp_account_sid ? '***' + config.whatsapp_account_sid.slice(-4) : 'Not Set');
    console.log('From Number:', config.whatsapp_phone_number || 'Not Set');

    // Test sending to a dummy number (or user provided number if I knew it)
    // Using a safe dummy number that likely fails but confirms the attempt structure
    const testNumber = '+919999999999';

    try {
        console.log(`Attempting to send message to ${testNumber}...`);
        const result = await whatsappService.sendMessage(testNumber, 'Test message from SIET CSE ERP via Twilio');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Manually test sending logic if needed
testWhatsApp();
console.log('Service loaded successfully.');
console.log('Provider:', whatsappService.provider);
