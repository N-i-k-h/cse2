import dotenv from 'dotenv';
import * as SibApiV3Sdk from '@sendinblue/client';

dotenv.config();

const testEmailDirect = async () => {
    console.log('API KEY:', process.env.BREVO_API_KEY ? 'Present' : 'Missing');

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "🚨 FINAL VERIFICATION TEST";
    sendSmtpEmail.htmlContent = "<html><body><h1>ERP SYSTEM TEST</h1><p>If you see this, the ERP email system is working perfectly.</p></body></html>";
    sendSmtpEmail.sender = { name: "SIET ERP", email: process.env.BREVO_SENDER_EMAIL };
    sendSmtpEmail.to = [{ email: "nikhillkashyapkn@gmail.com" }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    } catch (error) {
        console.error('API Error:', error.message);
    }
};

testEmailDirect();
