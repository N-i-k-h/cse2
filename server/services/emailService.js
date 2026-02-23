import * as SibApiV3Sdk from '@sendinblue/client';

// ── Brevo client setup ──────────────────────────────────────────────────────
const getApiInstance = () => {
  console.log(`🔑 BREVO_API_KEY status: ${!!process.env.BREVO_API_KEY ? 'Present' : 'MISSING'}`);
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  return apiInstance;
};

const getSender = () => ({
  name: process.env.BREVO_SENDER_NAME || 'SIET CSE Department',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@sietcse.edu'
});

// Helper: send one transactional email
const sendEmail = async (to, subject, htmlContent) => {
  const mail = new SibApiV3Sdk.SendSmtpEmail();
  mail.sender = getSender();
  mail.to = [to];
  mail.subject = subject;
  mail.htmlContent = htmlContent;
  const result = await getApiInstance().sendTransacEmail(mail);
  console.log('✅ Email sent to', to.email, '| msgId:', result?.body?.messageId);
  return result;
};

// Period number → human-readable time slot
const periodTime = (period) => {
  const slots = {
    1: '8:30 AM – 9:20 AM',
    2: '9:20 AM – 10:10 AM',
    3: '10:30 AM – 11:20 AM',
    4: '11:20 AM – 12:10 PM',
    5: '1:10 PM – 2:00 PM',
    6: '2:00 PM – 2:50 PM',
    7: '3:00 PM – 3:50 PM',
    8: '3:50 PM – 4:30 PM',
  };
  return slots[period] || `Period ${period}`;
};

const year = new Date().getFullYear();

// ── 1. STUDENT ATTENDANCE EMAIL ─────────────────────────────────────────────
/**
 * @param {Object} p
 * @param {string} p.studentEmail
 * @param {string} p.studentName
 * @param {string} p.subject          - Subject name
 * @param {string} p.date             - ISO date string
 * @param {string} p.status           - 'absent' | 'late' | 'present'
 * @param {string} p.facultyName
 * @param {string} p.day              - Day name e.g. 'Monday'
 * @param {number} p.period           - Period number
 * @param {string} p.className        - e.g. '6A' or 'CS-B'
 * @param {number} p.semester
 * @param {number} p.yearOfStudy
 * @param {number} p.attendancePct    - Overall attendance %
 */
export const sendAttendanceEmail = async (p) => {
  const {
    studentEmail, studentName, subject, date, status,
    facultyName, day = '', period = '', className = '',
    semester = '', yearOfStudy = '', attendancePct = null
  } = p;

  const s = (status || '').toLowerCase();
  const isAbsent = s === 'absent';
  const isLate = s === 'late';

  // Only send for absent / late
  if (!isAbsent && !isLate) return null;

  const statusColor = isAbsent ? '#EF4444' : '#F59E0B';
  const statusBg = isAbsent ? '#FEF2F2' : '#FFFBEB';
  const statusText = isAbsent ? 'ABSENT' : 'LATE';
  const statusIcon = isAbsent ? '❌' : '⏰';

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const timeSlot = period ? periodTime(period) : '';

  const pctBlock = attendancePct !== null ? `
        <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Attendance %</strong></td>
            <td style="padding:8px 0;font-size:14px;">
                <span style="color:${attendancePct < 75 ? '#EF4444' : '#22C55E'};font-weight:bold;">
                    ${attendancePct}%
                </span>
                ${attendancePct < 75
      ? '<span style="color:#EF4444;font-size:12px;margin-left:8px;">⚠️ Below 75%</span>'
      : '<span style="color:#22C55E;font-size:12px;margin-left:8px;">✅ Satisfactory</span>'}
            </td>
        </tr>` : '';

  const warningBlock = isAbsent ? `
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;padding:15px 20px;border-radius:6px;margin:20px 0;">
            <p style="margin:0;color:#991B1B;font-size:14px;line-height:1.7;">
                <strong>⚠️ Action Required:</strong> You were marked <strong>Absent</strong> for this class.
                Maintain at least 75% attendance to be eligible for exams.
                If this absence is due to valid reasons, please submit documentation to your faculty.
            </p>
        </div>` : `
        <div style="background:#FFFBEB;border-left:4px solid #F59E0B;padding:15px 20px;border-radius:6px;margin:20px 0;">
            <p style="margin:0;color:#92400E;font-size:14px;line-height:1.7;">
                <strong>⏰ Note:</strong> You were marked <strong>Late</strong> for this class.
                Repeated late entries may be treated as absences. Please arrive on time.
            </p>
        </div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Attendance Update</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f3f4f6;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="padding:32px;background:linear-gradient(135deg,${statusColor} 0%,${isAbsent ? '#DC2626' : '#D97706'} 100%);border-radius:16px 16px 0 0;text-align:center;">
          <div style="font-size:42px;margin-bottom:8px;">${statusIcon}</div>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:bold;">Attendance Update</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">SIET CSE Department – Student Notification</p>
        </td>
      </tr>

      <!-- Status Badge -->
      <tr>
        <td style="padding:28px 30px 0;text-align:center;">
          <span style="display:inline-block;background:${statusColor};color:#ffffff;padding:10px 36px;border-radius:30px;font-size:20px;font-weight:bold;letter-spacing:2px;">
            ${statusText}
          </span>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:24px 30px 0;">
          <p style="margin:0;color:#374151;font-size:16px;line-height:1.6;">
            Dear <strong>${studentName}</strong>,
          </p>
          <p style="margin:12px 0 0;color:#374151;font-size:15px;line-height:1.7;">
            Your attendance has been marked as
            <strong style="color:${statusColor};">${statusText}</strong>
            for the following class session:
          </p>
        </td>
      </tr>

      <!-- Details Card -->
      <tr>
        <td style="padding:20px 30px;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background:${statusBg};border-radius:10px;">
            <tr><td style="padding:20px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;"><strong>Subject</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Date</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">${formattedDate}</td>
                </tr>
                ${day ? `<tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Day</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">${day}</td>
                </tr>` : ''}
                ${timeSlot ? `<tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Time Slot</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">Period ${period} &nbsp;(${timeSlot})</td>
                </tr>` : ''}
                ${className ? `<tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Class / Section</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">${className}${semester ? ' &nbsp;|&nbsp; Sem ' + semester : ''}${yearOfStudy ? ' &nbsp;|&nbsp; Year ' + yearOfStudy : ''}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;"><strong>Marked By</strong></td>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">${facultyName}</td>
                </tr>
                ${pctBlock}
              </table>
            </td></tr>
          </table>
        </td>
      </tr>

      <!-- Warning / Note -->
      <tr>
        <td style="padding:0 30px;">
          ${warningBlock}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 30px;background:#f9fafb;border-radius:0 0 16px 16px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">This is an automated notification from the SIET CSE Department.</p>
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Please do not reply to this email.</p>
          <p style="margin:0;color:#9ca3af;font-size:11px;">© ${year} SIET CSE Department. All rights reserved.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  return sendEmail(
    { email: studentEmail, name: studentName },
    `${statusIcon} Attendance ${statusText}: ${subject} – ${formattedDate}`,
    html
  );
};


// ── 2. FACULTY CLASS ASSIGNMENT EMAIL ───────────────────────────────────────
/**
 * @param {Object} p
 * @param {string} p.facultyEmail
 * @param {string} p.facultyName
 * @param {string} p.subject
 * @param {string} p.day              - e.g. 'Monday'
 * @param {number} p.period           - Period number
 * @param {string} p.className        - e.g. '6A'
 * @param {number} p.semester
 * @param {number} p.yearOfStudy
 * @param {string} p.section
 * @param {string} p.roomNumber
 * @param {boolean} p.isUpdate        - true = updated, false = newly assigned
 */
export const sendClassAssignmentEmail = async (p) => {
  const {
    facultyEmail, facultyName, subject, day, period,
    className = '', semester = '', yearOfStudy = '',
    section = '', roomNumber = '', isUpdate = false
  } = p;

  const timeSlot = periodTime(period);
  const action = isUpdate ? 'Updated' : 'New Assignment';
  const icon = isUpdate ? '🔄' : '📋';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Class Assignment</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f3f4f6;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background:#ffffff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="padding:32px;background:linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%);border-radius:16px 16px 0 0;text-align:center;">
          <div style="font-size:42px;margin-bottom:8px;">${icon}</div>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:bold;">Class ${action}</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">SIET CSE Department – Faculty Notification</p>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:28px 30px 12px;">
          <p style="margin:0;color:#374151;font-size:16px;line-height:1.6;">
            Dear <strong>${facultyName}</strong>,
          </p>
          <p style="margin:12px 0 0;color:#374151;font-size:15px;line-height:1.7;">
            ${isUpdate
      ? 'Your class schedule has been <strong>updated</strong>. Please find the revised details below:'
      : 'You have been <strong>assigned a new class</strong>. Please find the schedule details below:'}
          </p>
        </td>
      </tr>

      <!-- Details Card -->
      <tr>
        <td style="padding:12px 30px 24px;">
          <table role="presentation" style="width:100%;border-collapse:collapse;background:#EFF6FF;border-radius:10px;">
            <tr><td style="padding:20px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;width:150px;"><strong>Subject</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:15px;font-weight:700;">${subject}</td>
                </tr>
                <tr style="background:rgba(255,255,255,0.5);">
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;"><strong>Day</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:14px;">${day}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;"><strong>Period</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:14px;">Period ${period} &nbsp;
                    <span style="background:#3B82F6;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">${timeSlot}</span>
                  </td>
                </tr>
                <tr style="background:rgba(255,255,255,0.5);">
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;"><strong>Class</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:14px;">${className}${section ? ' – Section ' + section : ''}</td>
                </tr>
                ${semester ? `<tr>
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;"><strong>Semester / Year</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:14px;">Semester ${semester}${yearOfStudy ? ' &nbsp;|&nbsp; Year ' + yearOfStudy : ''}</td>
                </tr>` : ''}
                ${roomNumber ? `<tr style="background:rgba(255,255,255,0.5);">
                  <td style="padding:9px 0;color:#6b7280;font-size:14px;"><strong>Room Number</strong></td>
                  <td style="padding:9px 0;color:#111827;font-size:14px;">${roomNumber}</td>
                </tr>` : ''}
              </table>
            </td></tr>
          </table>
        </td>
      </tr>

      <!-- Note -->
      <tr>
        <td style="padding:0 30px 24px;">
          <div style="background:#EFF6FF;border-left:4px solid #3B82F6;padding:15px 20px;border-radius:6px;">
            <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.7;">
              <strong>📌 Reminder:</strong> Please update your attendance records through the SIET ERP portal after each class session.
              If you believe this assignment is incorrect, contact the HOD or Admin.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 30px;background:#f9fafb;border-radius:0 0 16px 16px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">This is an automated notification from the SIET CSE Department.</p>
          <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Please do not reply to this email.</p>
          <p style="margin:0;color:#9ca3af;font-size:11px;">© ${year} SIET CSE Department. All rights reserved.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  const emailSubject = `${icon} Class ${action}: ${subject} – ${day} Period ${period}`;

  console.log(`✉️ emailService: Sending assignment to ${facultyEmail} for ${subject}`);
  try {
    const result = await sendEmail(
      { email: facultyEmail, name: facultyName },
      emailSubject,
      html
    );
    console.log(`✅ emailService: Brevo accepted. messageId:`, result?.body?.messageId);
    import('fs').then(fs => {
      fs.appendFileSync('sent_emails.log', `${new Date().toISOString()} - SUCCESS - To: ${facultyEmail}, Subject: ${emailSubject}, MessageID: ${result?.body?.messageId}\n`);
    }).catch(() => { });
    return result;
  } catch (err) {
    console.error(`❌ emailService error:`, err.message);
    throw err;
  }
};


// ── 3. BULK ATTENDANCE (convenience wrapper) ────────────────────────────────
export const sendBulkAttendanceEmails = async (records) => {
  const results = { success: [], failed: [] };
  for (const r of records) {
    try {
      const res = await sendAttendanceEmail(r);
      if (res) results.success.push(r.studentEmail);
    } catch (err) {
      results.failed.push({ email: r.studentEmail, error: err.message });
    }
  }
  console.log(`📧 Bulk email: ${results.success.length} sent, ${results.failed.length} failed`);
  return results;
};
