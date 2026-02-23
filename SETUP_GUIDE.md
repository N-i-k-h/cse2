# SIET CSE ERP - Complete Setup Guide

## 🎯 Overview
This guide will help you set up the complete SIET CSE ERP system with MySQL database backend (3NF compliant) and React frontend.

## 📋 Prerequisites

### Required Software
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MySQL Server** v8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** (optional, for version control)

### Check Installations
```bash
node --version
npm --version
mysql --version
```

---

## 🗄️ Part 1: Database Setup

### Step 1: Start MySQL Server

**Windows:**
```bash
# Start MySQL service
net start MySQL80
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
# or
sudo service mysql start
```

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE siet_cse_erp;

-- Verify creation
SHOW DATABASES;

-- Exit MySQL
EXIT;
```

### Step 3: Run Schema

```bash
# Navigate to server directory
cd server

# Import schema
mysql -u root -p siet_cse_erp < database/schema.sql
```

### Step 4: Verify Tables

```bash
mysql -u root -p siet_cse_erp
```

```sql
-- Show all tables
SHOW TABLES;

-- Should display:
-- +---------------------------+
-- | Tables_in_siet_cse_erp   |
-- +---------------------------+
-- | attendance                |
-- | classes                   |
-- | departments               |
-- | enrollments               |
-- | faculty                   |
-- | marks                     |
-- | students                  |
-- | timetable                 |
-- | users                     |
-- +---------------------------+

-- Check default data
SELECT * FROM departments;
SELECT * FROM users;

EXIT;
```

---

## 🔧 Part 2: Backend Setup

### Step 1: Install Dependencies

```bash
# From project root
cd server

# Install packages
npm install
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Update these values in `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=siet_cse_erp
DB_PORT=3306

JWT_SECRET=change_this_to_a_random_secret_key
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

### Step 3: Start Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# You should see:
# ✅ MySQL Database connected successfully
# 🚀 Server running on port 5000
# 📡 API available at http://localhost:5000/api
```

### Step 4: Test API

Open browser or use curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","message":"SIET CSE ERP Server is running"}
```

---

## 💻 Part 3: Frontend Setup

### Step 1: Install Frontend Dependencies

```bash
# Open NEW terminal, navigate to project root
cd ..  # if you're in server directory

# Install packages
npm install

# Install axios for API calls
npm install axios
```

### Step 2: Configure Frontend Environment

The `.env` file should already exist with:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start Frontend

```bash
npm run dev

# You should see:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

---

## 🎉 Part 4: First Login

### Step 1: Open Application

Navigate to: `http://localhost:5173`

### Step 2: Login with Default Admin

**Email:** `admin@cse`  
**Password:** `admin123`

### Step 3: Change Admin Password

⚠️ **IMPORTANT:** Immediately change the default password!

1. Go to Settings or Profile
2. Change password to something secure
3. Save changes

---

## 📊 Part 5: Add Sample Data

### Option 1: Using the UI

1. **Add Faculty:**
   - Navigate to Faculty Management
   - Click "Add Faculty"
   - Fill in details
   - Auto-generate password or set custom one

2. **Add Students:**
   - Navigate to Student Management
   - Click "Enroll Student"
   - Fill in details
   - System auto-generates password

3. **Create Classes:**
   - Navigate to Class Setup
   - Click "Create New Class"
   - Assign class teacher
   - Set room number

### Option 2: Using SQL (Quick Sample Data)

```sql
-- Login to MySQL
mysql -u root -p siet_cse_erp

-- Add sample faculty
INSERT INTO users (email, password_hash, role, department_id) 
VALUES ('prof.sharma@cse', '$2b$10$rKvVPZqGfJxHYLz5gN8kPOxKqJXqJxQxJxQxJxQxJxQxJxQxJxQ', 'staff', 1);

INSERT INTO faculty (user_id, first_name, last_name, phone, designation, highest_degree, experience_total)
VALUES (LAST_INSERT_ID(), 'Rajesh', 'Sharma', '9876543210', 'Assistant Professor', 'PhD', 8);

-- Add sample student
INSERT INTO users (email, password_hash, role, department_id) 
VALUES ('student001@cse', '$2b$10$rKvVPZqGfJxHYLz5gN8kPOxKqJXqJxQxJxQxJxQxJxQxJxQxJxQ', 'student', 1);

INSERT INTO students (user_id, usn, first_name, last_name, phone, year, semester, section)
VALUES (LAST_INSERT_ID(), '1SI23CS001', 'Amit', 'Kumar', '9123456789', 2, 3, 'A');
```

---

## 🔍 Verification Checklist

- [ ] MySQL server is running
- [ ] Database `siet_cse_erp` exists with all tables
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login with admin credentials
- [ ] Can create students
- [ ] Can create faculty
- [ ] Can create classes

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "ER_ACCESS_DENIED_ERROR"**
- Check MySQL credentials in `server/.env`
- Verify MySQL user has permissions

**Error: "ER_BAD_DB_ERROR"**
- Database doesn't exist
- Run: `CREATE DATABASE siet_cse_erp;`

**Error: "Port 5000 already in use"**
- Change PORT in `server/.env`
- Or kill process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

### Frontend API errors

**Error: "Network Error"**
- Backend server not running
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in backend

**Error: "401 Unauthorized"**
- Token expired
- Clear localStorage and login again

### Database connection issues

```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
net start MySQL80           # Windows

# Test connection
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'siet_cse_erp';"
```

---

## 📚 Next Steps

1. **Customize Settings:**
   - Update department information
   - Configure academic year
   - Set attendance thresholds

2. **Bulk Import:**
   - Prepare CSV files for students/faculty
   - Use import feature (if implemented)

3. **Backup Strategy:**
   ```bash
   # Backup database
   mysqldump -u root -p siet_cse_erp > backup_$(date +%Y%m%d).sql
   
   # Restore database
   mysql -u root -p siet_cse_erp < backup_20260202.sql
   ```

4. **Production Deployment:**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Set up proper MySQL user (not root)
   - Configure firewall rules

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review server logs
3. Check browser console for frontend errors
4. Verify database connection

---

## 🎓 Database Schema Overview

The database follows **Third Normal Form (3NF)** standards:

- **No transitive dependencies**
- **Proper foreign key relationships**
- **Normalized data structure**
- **Referential integrity maintained**

### Key Relationships:
- Users → Faculty/Students (1:1)
- Classes → Faculty (Many:1 for class teacher)
- Students → Classes (Many:Many via Enrollments)
- Timetable → Classes & Faculty (Many:1)
- Attendance → Students & Timetable (Many:Many)

---

**🚀 You're all set! Happy managing!**
