# Twilio WhatsApp Sandbox Setup Guide

## 🚀 Quick Start - Free Twilio Sandbox

The Twilio WhatsApp Sandbox is **completely FREE** and perfect for testing. No credit card required!

---

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get **$15 free credit** (not needed for sandbox)

---

## Step 2: Access WhatsApp Sandbox

1. Login to [Twilio Console](https://console.twilio.com/)
2. Navigate to: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see the sandbox configuration page

---

## Step 3: Join the Sandbox

### On the Sandbox Page, you'll see:

```
Send this code in WhatsApp to join your sandbox:
join [your-sandbox-name]

To: +1 415 523 8886
```

### Steps:
1. Open **WhatsApp** on your phone
2. Add the number **+1 415 523 8886** to your contacts (optional)
3. Send a message: **`join [your-sandbox-name]`**
   - Example: `join happy-mountain`
4. You'll receive a confirmation: **"Sandbox joined! You can now send messages..."**

---

## Step 4: Get Your Credentials

### Account SID & Auth Token

1. Go to [Twilio Console Dashboard](https://console.twilio.com/)
2. You'll see:
   ```
   Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token: [click to reveal]
   ```
3. **Copy both values**

### From Number (Sandbox)

- The sandbox number is always: **`whatsapp:+14155238886`**
- Include the `whatsapp:` prefix!

---

## Step 5: Configure in SIET CSE ERP

1. Login as **Admin**
2. Go to **Settings** page
3. **WhatsApp Integration** section:
   - **Provider:** Select **"Twilio (Sandbox & Production)"**
   - **Account SID:** Paste your Account SID
   - **Auth Token:** Paste your Auth Token
   - **From Number:** Enter `whatsapp:+14155238886`
4. Click **"Save All Settings"**

---

## Step 6: Test the Integration

### Option A: Using the Test Endpoint

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "whatsapp:+919876543210",
    "message": "Test from SIET CSE ERP!"
  }'
```

**Note:** The recipient must have joined your sandbox first!

### Option B: Test Attendance Notification

1. Add a student with parent phone number: `whatsapp:+919876543210`
2. Mark attendance with notification enabled
3. Parent will receive WhatsApp message!

---

## 📱 Adding Recipients to Sandbox

**IMPORTANT:** Anyone who wants to receive messages must join your sandbox first!

### Steps for Parents/Students:

1. Save **+1 415 523 8886** in WhatsApp
2. Send: **`join [your-sandbox-name]`**
3. Wait for confirmation
4. Now they can receive messages!

### Sandbox Limitations:

- ❌ Only people who joined can receive messages
- ❌ Sandbox name appears in messages
- ✅ Completely FREE
- ✅ Perfect for testing
- ✅ No message limits

---

## 🎯 Example Configuration

### In Settings Page:

```
Provider: Twilio (Sandbox & Production)
Account SID: YOUR_TWILIO_ACCOUNT_SID
Auth Token: YOUR_TWILIO_AUTH_TOKEN
From Number: whatsapp:+14155238886
```

### Phone Number Format:

**For Sandbox Recipients:**
- ✅ `whatsapp:+919876543210`
- ✅ `whatsapp:+14155551234`
- ❌ `+919876543210` (missing whatsapp: prefix)
- ❌ `9876543210` (missing country code)

---

## 🔄 Upgrading to Production (Optional)

When ready for production (to send to anyone without sandbox join):

### 1. Request WhatsApp Business Profile

1. Go to Twilio Console → Messaging → Senders → WhatsApp senders
2. Click **"Request to enable my Twilio numbers for WhatsApp"**
3. Fill out the form (business details, use case)
4. Wait for approval (1-3 business days)

### 2. Get a Dedicated Number

1. Buy a Twilio phone number
2. Enable WhatsApp on it
3. Update settings with your new number

### 3. Update Configuration

```
From Number: whatsapp:+14155551234  (your number)
```

**Cost:** ~$1.50/month for number + $0.005 per message

---

## 📊 Testing Scenarios

### Test 1: Simple Message

```javascript
POST /api/notifications/test
{
  "phone_number": "whatsapp:+919876543210",
  "message": "Hello from SIET CSE ERP!"
}
```

### Test 2: Attendance Notification

```javascript
POST /api/attendance/mark
{
  "student_id": 1,
  "timetable_id": 5,
  "date": "2026-02-02",
  "status": "absent",
  "send_notification": true
}
```

### Test 3: Marks Notification

```javascript
POST /api/marks
{
  "student_id": 1,
  "subject": "Data Structures",
  "exam_type": "midterm",
  "marks_obtained": 85,
  "max_marks": 100,
  "send_notification": true
}
```

---

## 🐛 Troubleshooting

### Issue: "Recipient not in sandbox"

**Solution:** Recipient must send `join [sandbox-name]` to +1 415 523 8886

### Issue: "Invalid phone number"

**Solution:** Use format `whatsapp:+[country_code][number]`
- Example: `whatsapp:+919876543210`

### Issue: "Authentication failed"

**Solution:** 
- Check Account SID and Auth Token are correct
- Make sure no extra spaces
- Auth Token is case-sensitive

### Issue: "Message not delivered"

**Solution:**
- Verify recipient joined sandbox
- Check phone number format
- Ensure recipient has WhatsApp installed

---

## 📝 Sample Student Data

When adding students, use this format for parent phone:

```sql
INSERT INTO students (
    first_name, 
    last_name, 
    parent_name, 
    parent_phone,
    ...
) VALUES (
    'Amit',
    'Kumar',
    'Rajesh Kumar',
    'whatsapp:+919876543210',  -- Include whatsapp: prefix!
    ...
);
```

---

## 🎓 Complete Example Workflow

### 1. Setup (One-time)

```bash
# 1. Create Twilio account
# 2. Join sandbox from your phone
# 3. Get Account SID & Auth Token
# 4. Configure in Settings page
```

### 2. Add Student

```javascript
// Add student with parent phone
{
  "first_name": "Amit",
  "last_name": "Kumar",
  "parent_name": "Rajesh Kumar",
  "parent_phone": "whatsapp:+919876543210",
  ...
}
```

### 3. Parent Joins Sandbox

```
Parent sends from WhatsApp:
To: +1 415 523 8886
Message: join happy-mountain
```

### 4. Mark Attendance

```javascript
POST /api/attendance/mark
{
  "student_id": 1,
  "timetable_id": 5,
  "date": "2026-02-02",
  "status": "absent",
  "send_notification": true
}
```

### 5. Parent Receives Message

```
🎓 *SIET CSE - Attendance Alert*

Dear Rajesh Kumar,

Student: Amit Kumar
Class: 2A
Date: 02/02/2026
Status: ABSENT

⚠️ Your ward was marked ABSENT today.

For any queries, please contact the class teacher.

- SIET, Dept of CSE
```

---

## 💡 Pro Tips

1. **Test with Your Own Number First**
   - Join sandbox with your WhatsApp
   - Test all notification types
   - Verify message formatting

2. **Inform Parents**
   - Send instructions to join sandbox
   - Provide your sandbox name
   - Explain they'll receive attendance/marks updates

3. **Monitor Usage**
   - Check Twilio Console for message logs
   - Monitor delivery status
   - Track any errors

4. **Rate Limiting**
   - Sandbox has no message limits
   - But add delays between bulk messages (already implemented)
   - 1 second delay per message

---

## 🔗 Useful Links

- [Twilio Console](https://console.twilio.com/)
- [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
- [Twilio WhatsApp API Docs](https://www.twilio.com/docs/whatsapp)
- [Twilio Support](https://support.twilio.com/)

---

## ✅ Checklist

Before going live:

- [ ] Twilio account created
- [ ] Sandbox joined from your phone
- [ ] Account SID copied
- [ ] Auth Token copied
- [ ] Settings configured in ERP
- [ ] Test message sent successfully
- [ ] Test attendance notification sent
- [ ] Test marks notification sent
- [ ] Parents informed about joining sandbox
- [ ] Parent phone numbers in correct format
- [ ] All notifications working

---

**🎉 You're all set! Start sending WhatsApp notifications to parents!**

For production deployment, consider upgrading to a dedicated Twilio number.
