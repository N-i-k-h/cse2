# Settings Module - API Key Management

## ✅ What Was Created

### 1. Database Schema Update
**File:** `server/database/schema.sql`

Added `system_settings` table to store API keys and configuration:

```sql
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_category ENUM('auth', 'whatsapp', 'sms', 'email', 'general') NOT NULL,
    is_encrypted BOOLEAN DEFAULT FALSE,
    description VARCHAR(255),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (setting_category),
    INDEX idx_key (setting_key)
);
```

**Features:**
- ✅ Stores settings by category (auth, whatsapp, sms, email, general)
- ✅ Tracks who updated each setting
- ✅ Supports encryption flag for sensitive data
- ✅ Indexed for fast lookups

---

### 2. Backend API Routes
**File:** `server/routes/settings.js`

**Endpoints:**
- `GET /api/settings` - Get all settings (with optional category filter)
- `GET /api/settings/category/:category` - Get settings by category
- `GET /api/settings/key/:key` - Get single setting by key
- `POST /api/settings` - Create or update single setting
- `PUT /api/settings/bulk` - Bulk update multiple settings
- `DELETE /api/settings/:id` - Delete setting

**Security:**
- ✅ Admin-only access (roleMiddleware)
- ✅ JWT authentication required
- ✅ Transaction support for bulk updates

---

### 3. Frontend Service
**File:** `src/services/settingsService.ts`

TypeScript service for API interactions:
```typescript
settingsService.getAll(category?)
settingsService.getByCategory(category)
settingsService.getByKey(key)
settingsService.save(setting)
settingsService.bulkUpdate(settings)
settingsService.delete(id)
```

---

### 4. Settings Page UI
**File:** `src/pages/admin/Settings.tsx`

**Features:**
- ✅ **4 Configuration Sections:**
  1. **Authentication** - JWT secret, token expiry, session timeout
  2. **WhatsApp Integration** - API key, phone number, business ID
  3. **SMS Integration** - API key, sender ID, provider selection
  4. **Email Configuration** - SMTP host, port, username, password, from address

- ✅ **Security Features:**
  - Password/API key masking with show/hide toggle
  - Visual indicators for sensitive fields
  - Security notice about credential storage

- ✅ **User Experience:**
  - Responsive grid layout (2 columns on desktop)
  - Color-coded sections (blue, green, purple, red)
  - Loading states
  - Bulk save functionality
  - Clear visual hierarchy

---

## 🎨 UI Design

### Layout
```
┌─────────────────────────────────────────────────────┐
│  System Settings                    [Save All]      │
├──────────────────┬──────────────────────────────────┤
│  Authentication  │  WhatsApp Integration            │
│  🛡️ JWT Config   │  💬 Business API                 │
│                  │                                   │
├──────────────────┼──────────────────────────────────┤
│  SMS Integration │  Email Configuration             │
│  📱 Gateway      │  📧 SMTP Server                  │
│                  │                                   │
└──────────────────┴──────────────────────────────────┘
```

### Color Scheme
- **Authentication:** Blue (`bg-blue-50`, `text-blue-600`)
- **WhatsApp:** Green (`bg-green-50`, `text-green-600`)
- **SMS:** Purple (`bg-purple-50`, `text-purple-600`)
- **Email:** Red (`bg-red-50`, `text-red-600`)

---

## 📊 Settings Categories

### 1. Authentication Settings
| Setting Key | Description | Type |
|------------|-------------|------|
| `jwt_secret` | JWT Secret Key | Password |
| `jwt_expiry` | Token Expiry (e.g., 7d, 24h) | Text |
| `session_timeout` | Session Timeout (minutes) | Number |

### 2. WhatsApp Settings
| Setting Key | Description | Type |
|------------|-------------|------|
| `whatsapp_api_key` | WhatsApp API Key | Password |
| `whatsapp_phone_number` | WhatsApp Phone Number | Text |
| `whatsapp_business_id` | WhatsApp Business ID | Text |

### 3. SMS Settings
| Setting Key | Description | Type |
|------------|-------------|------|
| `sms_api_key` | SMS API Key | Password |
| `sms_sender_id` | SMS Sender ID | Text |
| `sms_provider` | SMS Provider | Select (Twilio, MSG91, TextLocal, AWS SNS) |

### 4. Email Settings
| Setting Key | Description | Type |
|------------|-------------|------|
| `smtp_host` | SMTP Host | Text |
| `smtp_port` | SMTP Port | Text |
| `smtp_user` | SMTP Username | Text |
| `smtp_password` | SMTP Password | Password |
| `email_from` | From Email Address | Email |

---

## 🔐 Security Considerations

### Current Implementation
- ✅ Admin-only access
- ✅ Password masking in UI
- ✅ Audit trail (updated_by field)
- ✅ HTTPS recommended for production

### Recommended Enhancements
1. **Encryption at Rest:**
   ```javascript
   // Add encryption for sensitive values
   import crypto from 'crypto';
   
   const encrypt = (text) => {
       const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
       return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
   };
   ```

2. **Environment Variable Sync:**
   - Automatically update `.env` file when settings change
   - Restart services when critical settings update

3. **Validation:**
   - Add format validation for API keys
   - Test SMTP connection before saving
   - Verify WhatsApp/SMS credentials

---

## 🚀 Usage

### 1. Access Settings
1. Login as Admin
2. Navigate to **Settings** from sidebar
3. Configure API keys

### 2. Save Settings
- Edit any field
- Click **"Save All Settings"** button
- Settings are saved to database

### 3. Use Settings in Code

**Backend Example:**
```javascript
// Get SMTP settings
const [settings] = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key = ?',
    ['smtp_host']
);

const smtpHost = settings[0]?.setting_value;
```

**Frontend Example:**
```typescript
// Load settings
const emailSettings = await settingsService.getByCategory('email');
```

---

## 📝 Database Migration

To add the settings table to existing database:

```bash
# Option 1: Re-run full schema
mysql -u root -p siet_cse_erp < server/database/schema.sql

# Option 2: Add table only
mysql -u root -p siet_cse_erp
```

```sql
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_category ENUM('auth', 'whatsapp', 'sms', 'email', 'general') NOT NULL,
    is_encrypted BOOLEAN DEFAULT FALSE,
    description VARCHAR(255),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (setting_category),
    INDEX idx_key (setting_key)
);
```

---

## 🧪 Testing

### Test API Endpoints

```bash
# Get all settings
curl http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get email settings
curl http://localhost:5000/api/settings/category/email \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save setting
curl -X POST http://localhost:5000/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "setting_key": "smtp_host",
    "setting_value": "smtp.gmail.com",
    "setting_category": "email",
    "description": "SMTP Host"
  }'

# Bulk update
curl -X PUT http://localhost:5000/api/settings/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {
        "setting_key": "smtp_host",
        "setting_value": "smtp.gmail.com",
        "setting_category": "email"
      },
      {
        "setting_key": "smtp_port",
        "setting_value": "587",
        "setting_category": "email"
      }
    ]
  }'
```

---

## 🎯 Next Steps

### Integration Examples

1. **Send Email Using Settings:**
```javascript
import nodemailer from 'nodemailer';

const getEmailConfig = async () => {
    const [settings] = await pool.query(
        'SELECT setting_key, setting_value FROM system_settings WHERE setting_category = "email"'
    );
    
    const config = {};
    settings.forEach(s => config[s.setting_key] = s.setting_value);
    
    return nodemailer.createTransport({
        host: config.smtp_host,
        port: config.smtp_port,
        auth: {
            user: config.smtp_user,
            pass: config.smtp_password
        }
    });
};
```

2. **Send SMS:**
```javascript
import twilio from 'twilio';

const sendSMS = async (to, message) => {
    const [settings] = await pool.query(
        'SELECT setting_key, setting_value FROM system_settings WHERE setting_category = "sms"'
    );
    
    const config = {};
    settings.forEach(s => config[s.setting_key] = s.setting_value);
    
    const client = twilio(config.sms_api_key, config.sms_api_secret);
    
    await client.messages.create({
        body: message,
        from: config.sms_sender_id,
        to: to
    });
};
```

3. **Send WhatsApp:**
```javascript
// Using WhatsApp Business API
const sendWhatsApp = async (to, message) => {
    const [settings] = await pool.query(
        'SELECT setting_key, setting_value FROM system_settings WHERE setting_category = "whatsapp"'
    );
    
    const config = {};
    settings.forEach(s => config[s.setting_key] = s.setting_value);
    
    // Implementation depends on WhatsApp provider
};
```

---

## 📋 Checklist

- [x] Database table created
- [x] Backend routes implemented
- [x] Frontend service created
- [x] Settings UI page built
- [x] Routing configured
- [x] Admin-only access enforced
- [ ] Encryption implementation (optional)
- [ ] Email sending integration
- [ ] SMS sending integration
- [ ] WhatsApp sending integration

---

**✅ Settings module is ready! Admins can now configure all API keys through the UI.**
