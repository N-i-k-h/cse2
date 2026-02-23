# SIET CSE ERP - Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Database

#### Create MySQL Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE siet_cse_erp;
USE siet_cse_erp;
```

#### Run Schema
```bash
mysql -u root -p siet_cse_erp < database/schema.sql
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=siet_cse_erp
DB_PORT=3306

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Students
- `GET /api/students` - Get all students (with filters)
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)
- `GET /api/students/:id/attendance` - Get student attendance

### Faculty
- `GET /api/faculty` - Get all faculty (with filters)
- `GET /api/faculty/:id` - Get single faculty
- `POST /api/faculty` - Create faculty (Admin only)
- `PUT /api/faculty/:id` - Update faculty (Admin only)
- `PUT /api/faculty/:id/password` - Update faculty password (Admin only)
- `DELETE /api/faculty/:id` - Delete faculty (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get single class
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)
- `GET /api/classes/:id/students` - Get students in class

## Default Admin Credentials

**Email:** admin@cse  
**Password:** admin123

⚠️ **IMPORTANT:** Change the default admin password immediately after first login!

## Database Schema (3NF Compliant)

### Tables
1. **departments** - Department information
2. **users** - Base authentication table
3. **faculty** - Faculty-specific details
4. **students** - Student-specific details
5. **classes** - Class sections
6. **enrollments** - Student-class relationships
7. **timetable** - Class schedules
8. **attendance** - Attendance records
9. **marks** - Exam marks

### Key Features
- ✅ Third Normal Form (3NF) compliance
- ✅ Proper foreign key relationships
- ✅ Cascade delete operations
- ✅ Indexed columns for performance
- ✅ Transaction support for data integrity

## Testing the API

### Using curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cse","password":"admin123"}'

# Get students (with token)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:
1. Import the API endpoints
2. Set Authorization header: `Bearer YOUR_TOKEN`
3. Test CRUD operations

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
- Change PORT in `.env`
- Kill existing process: `lsof -ti:5000 | xargs kill`

### JWT Errors
- Verify JWT_SECRET is set in `.env`
- Check token expiration time

## Next Steps

1. ✅ Backend API is ready
2. Update frontend to use real API instead of mock data
3. Implement attendance marking system
4. Add timetable management
5. Create dashboard analytics endpoints
