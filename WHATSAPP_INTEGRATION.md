# WhatsApp Integration - Attendance & Marks Notifications

## ✅ What Was Created

### 1. WhatsApp Service (`server/services/whatsappService.js`)

A comprehensive service for sending WhatsApp notifications using **Meta WhatsApp Business API**.

**Features:**
- ✅ Automatic configuration loading from database settings
- ✅ Send attendance notifications to parents
- ✅ Send marks notifications to parents
- ✅ Bulk notification support
- ✅ Custom message sending
- ✅ Rate limiting protection (1-second delay between messages)

**Methods:**
```javascript
whatsappService.sendMessage(to, message)
whatsappService.sendAttendanceNotification(studentId, date, status)
whatsappService.sendMarksNotification(studentId, subject, examType, marksObtained, maxMarks)
whatsappService.sendBulkAttendanceNotifications(attendanceRecords)
whatsappService.sendBulkMarksNotifications(marksRecords)
```

---

### 2. Attendance Routes (`server/routes/attendance.js`)

**Endpoints:**

#### Mark Attendance (Single)
```
POST /api/attendance/mark
```
**Body:**
```json
{
  "student_id": 1,
  "timetable_id": 5,
  "date": "2026-02-02",
  "status": "present",
  "send_notification": true
}
```

#### Bulk Mark Attendance
```
POST /api/attendance/bulk-mark
```
**Body:**
```json
{
  "attendance_records": [
    {
      "student_id": 1,
      "timetable_id": 5,
      "date": "2026-02-02",
      "status": "present"
    },
    {
      "student_id": 2,
      "timetable_id": 5,
      "date": "2026-02-02",
      "status": "absent"
    }
  ],
  "send_notifications": true
}
```

#### Get Student Attendance
```
GET /api/attendance/student/:studentId?startDate=2026-01-01&endDate=2026-02-02
```

#### Get Attendance Summary
```
GET /api/attendance/student/:studentId/summary
```

#### Get Class Attendance
```
GET /api/attendance/class/:classId?date=2026-02-02
```

---

### 3. Marks Routes (`server/routes/marks.js`)

**Endpoints:**

#### Add Marks (Single)
```
POST /api/marks
```
**Body:**
```json
{
  "student_id": 1,
  "subject": "Data Structures",
  "exam_type": "midterm",
  "marks_obtained": 85,
  "max_marks": 100,
  "exam_date": "2026-02-01",
  "send_notification": true
}
```

#### Bulk Add Marks
```
POST /api/marks/bulk
```
**Body:**
```json
{
  "marks_records": [
    {
      "student_id": 1,
      "subject": "Data Structures",
      "exam_type": "midterm",
      "marks_obtained": 85,
      "max_marks": 100,
      "exam_date": "2026-02-01"
    },
    {
      "student_id": 2,
      "subject": "Data Structures",
      "exam_type": "midterm",
      "marks_obtained": 78,
      "max_marks": 100,
      "exam_date": "2026-02-01"
    }
  ],
  "send_notifications": true
}
```

#### Get Student Marks
```
GET /api/marks/student/:studentId?subject=Data%20Structures&exam_type=midterm
```

#### Get Marks Summary
```
GET /api/marks/student/:studentId/summary
```

#### Get Subject Marks
```
GET /api/marks/subject/:subject?exam_type=midterm
```

#### Update Marks
```
PUT /api/marks/:id
```

#### Delete Marks
```
DELETE /api/marks/:id
```

---

### 4. Notification Routes (`server/routes/notifications.js`)

**Endpoints:**

#### Test WhatsApp Configuration
```
POST /api/notifications/test
```
**Body:**
```json
{
  "phone_number": "+919876543210",
  "message": "Test message"
}
```

#### Send Custom Message
```
POST /api/notifications/send
```
**Body:**
```json
{
  "phone_number": "+919876543210",
  "message": "Your custom message here"
}
```

#### Send Attendance Notification (Manual)
```
POST /api/notifications/notify/attendance
```
**Body:**
```json
{
  "student_id": 1,
  "date": "2026-02-02",
  "status": "absent"
}
```

#### Send Marks Notification (Manual)
```
POST /api/notifications/notify/marks
```
**Body:**
```json
{
  "student_id": 1,
  "subject": "Data Structures",
  "exam_type": "midterm",
  "marks_obtained": 85,
  "max_marks": 100
}
```

#### Check Configuration Status
```
GET /api/notifications/config/status
```

---

## 📱 WhatsApp Message Templates

### Attendance Notification
```
🎓 *SIET CSE - Attendance Alert*

Dear [Parent Name],

Student: [Student Name]
Class: [Year][Section]
Date: [DD/MM/YYYY]
Status: PRESENT/ABSENT

✅ Your ward was marked PRESENT today.
⚠️ Your ward was marked ABSENT today.

For any queries, please contact the class teacher.

- SIET, Dept of CSE
```

### Marks Notification
```
📊 *SIET CSE - Marks Update*

Dear [Parent Name],

Student: [Student Name]
Class: [Year][Section]
Subject: [Subject Name]
Exam Type: MIDTERM/LAB/ASSIGNMENT/FINAL

Marks Obtained: 85/100
Percentage: 85.00%

🎉 Excellent performance!
👍 Good work!
📚 Needs improvement.
⚠️ Requires immediate attention.

Keep up the good work!

- SIET, Dept of CSE
```

---

## 🔧 Setup Instructions

### 1. Configure WhatsApp Business API

#### Option A: Meta WhatsApp Business API (Recommended)

1. **Create Facebook Business Account:**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Create a business account

2. **Set up WhatsApp Business API:**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create an app
   - Add WhatsApp product
   - Get your:
     - Phone Number ID (Business ID)
     - Access Token (API Key)
     - Phone Number

3. **Configure in Settings Page:**
   - Login as Admin
   - Go to Settings
   - WhatsApp Integration section:
     - **API Key:** Your access token
     - **Phone Number:** Your WhatsApp business phone number
     - **Business ID:** Your phone number ID
   - Click "Save All Settings"

#### Option B: Third-Party Providers

Alternatively, you can use:
- **Twilio WhatsApp API**
- **MessageBird**
- **Vonage (Nexmo)**
- **Gupshup**

(You'll need to modify the `whatsappService.js` to match their API format)

---

### 2. Test the Integration

```bash
# Test WhatsApp configuration
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "message": "Test from SIET CSE ERP"
  }'
```

---

## 📊 Usage Examples

### Example 1: Mark Attendance with Notification

```javascript
// Frontend code
const markAttendance = async (studentId, timetableId, status) => {
    const response = await api.post('/attendance/mark', {
        student_id: studentId,
        timetable_id: timetableId,
        date: new Date().toISOString().split('T')[0],
        status: status, // 'present', 'absent', 'late'
        send_notification: true // Enable WhatsApp notification
    });
    
    console.log('Attendance marked:', response.data);
    console.log('Notification sent:', response.data.notification);
};
```

### Example 2: Add Marks with Notification

```javascript
// Frontend code
const addMarks = async (studentId, subject, examType, marks, maxMarks) => {
    const response = await api.post('/marks', {
        student_id: studentId,
        subject: subject,
        exam_type: examType,
        marks_obtained: marks,
        max_marks: maxMarks,
        exam_date: new Date().toISOString().split('T')[0],
        send_notification: true // Enable WhatsApp notification
    });
    
    console.log('Marks added:', response.data);
    console.log('Notification sent:', response.data.notification);
};
```

### Example 3: Bulk Mark Attendance

```javascript
// Mark attendance for entire class
const markClassAttendance = async (classId, date, attendanceData) => {
    const records = attendanceData.map(student => ({
        student_id: student.id,
        timetable_id: student.timetable_id,
        date: date,
        status: student.status
    }));
    
    const response = await api.post('/attendance/bulk-mark', {
        attendance_records: records,
        send_notifications: true // Send to all parents
    });
    
    console.log(`Marked ${response.data.count} students`);
    console.log('Notifications:', response.data.notifications);
};
```

---

## 🔐 Security & Best Practices

### 1. Rate Limiting
The service includes a 1-second delay between bulk messages to avoid rate limiting. Adjust based on your API limits:

```javascript
// In whatsappService.js
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
```

### 2. Error Handling
Notifications are non-blocking. If WhatsApp fails, attendance/marks are still saved:

```javascript
// Notification failure doesn't affect data saving
try {
    notificationResult = await whatsappService.sendNotification(...);
} catch (error) {
    console.error('Notification failed:', error);
    // Continue anyway
}
```

### 3. Phone Number Format
Always store phone numbers with country code:
- ✅ `+919876543210`
- ❌ `9876543210`

### 4. Message Limits
- Meta WhatsApp Business API: 1000 messages/day (free tier)
- Upgrade for higher limits

---

## 📈 Monitoring & Logs

### Check Notification Status

```javascript
// Get configuration status
const status = await api.get('/notifications/config/status');

console.log('WhatsApp configured:', status.data.configured);
console.log('Has API key:', status.data.has_api_key);
console.log('Has phone number:', status.data.has_phone_number);
```

### Server Logs

```bash
# View server logs for notification status
npm run dev

# Look for:
# ✅ "WhatsApp message sent successfully"
# ❌ "WhatsApp send error: ..."
```

---

## 🎯 Next Steps

### 1. Create Frontend UI
- Attendance marking page with notification toggle
- Marks entry page with notification toggle
- Notification history page

### 2. Add More Notification Types
- Fee payment reminders
- Exam schedules
- Holiday announcements
- Important notices

### 3. Add SMS Integration
Similar to WhatsApp, create `smsService.js` for SMS notifications.

### 4. Add Email Integration
Create `emailService.js` for email notifications.

---

## 🐛 Troubleshooting

### Issue: "WhatsApp API not configured"
**Solution:** Configure WhatsApp settings in Settings page.

### Issue: "Invalid phone number"
**Solution:** Ensure phone numbers include country code (+91 for India).

### Issue: "Rate limit exceeded"
**Solution:** Increase delay between messages or upgrade API plan.

### Issue: "Message not delivered"
**Solution:** 
- Check if recipient has WhatsApp
- Verify phone number is correct
- Check WhatsApp Business API status

---

## 📝 API Response Examples

### Successful Attendance with Notification
```json
{
  "message": "Attendance marked successfully",
  "id": 123,
  "notification": {
    "success": true,
    "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwFQIAERgSQTBBMEE5..."
  }
}
```

### Bulk Marks with Notifications
```json
{
  "message": "Bulk marks added successfully",
  "count": 25,
  "notifications": [
    {
      "student_id": 1,
      "success": true,
      "messageId": "wamid.HBgNOTE5ODc2..."
    },
    {
      "student_id": 2,
      "success": false,
      "error": "Parent phone number not available"
    }
  ]
}
```

---

**✅ WhatsApp integration is complete! Configure your API keys in Settings and start sending automated notifications to parents!** 🎉
