# 🎯 SIET CSE ERP - MySQL Backend Implementation

## ✅ What Has Been Created

### Backend Structure (3NF MySQL Database)

#### 1. **Database Schema** (`server/database/schema.sql`)
- ✅ **9 normalized tables** following Third Normal Form (3NF)
- ✅ Proper foreign key relationships
- ✅ Cascade delete operations
- ✅ Indexed columns for performance
- ✅ Default admin user created

**Tables:**
- `departments` - Department information
- `users` - Base authentication (email, password, role)
- `faculty` - Faculty-specific details
- `students` - Student-specific details  
- `classes` - Class sections with room numbers
- `enrollments` - Student-class relationships (Many-to-Many)
- `timetable` - Class schedules
- `attendance` - Attendance tracking
- `marks` - Exam marks and grades

#### 2. **Backend API Server** (Node.js + Express + MySQL)

**Core Files:**
- `server/server.js` - Main Express application
- `server/config/database.js` - MySQL connection pool
- `server/middleware/auth.js` - JWT authentication & authorization
- `server/.env` - Environment configuration

**API Routes:**
- `server/routes/auth.js` - Login, password management
- `server/routes/students.js` - Student CRUD operations
- `server/routes/faculty.js` - Faculty CRUD operations  
- `server/routes/classes.js` - Class management

**Features:**
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, HOD, Staff, Student)
- ✅ Password hashing with bcrypt
- ✅ Transaction support for data integrity
- ✅ Comprehensive error handling
- ✅ CORS configuration

#### 3. **Frontend API Services** (TypeScript)

**Service Layer:**
- `src/services/api.ts` - Axios instance with interceptors
- `src/services/authService.ts` - Authentication operations
- `src/services/studentService.ts` - Student API calls
- `src/services/facultyService.ts` - Faculty API calls
- `src/services/classService.ts` - Class API calls

**Features:**
- ✅ Automatic token injection
- ✅ Token expiration handling
- ✅ Error interceptors
- ✅ TypeScript type safety

---

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE siet_cse_erp;
EXIT;

# Import schema
cd server
mysql -u root -p siet_cse_erp < database/schema.sql
```

### 2. Backend Setup

```bash
# Install dependencies
cd server
npm install

# Configure database password in server/.env
# DB_PASSWORD=your_mysql_password

# Start server
npm run dev
```

**Expected Output:**
```
✅ MySQL Database connected successfully
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

### 3. Frontend Setup

```bash
# Install dependencies (from project root)
npm install

# Start frontend
npm run dev
```

### 4. First Login

- **URL:** http://localhost:5173
- **Email:** admin@cse
- **Password:** admin123

---

## 📊 Database Schema (3NF Compliance)

### Normalization Rules Applied:

**1st Normal Form (1NF):**
- ✅ All columns contain atomic values
- ✅ No repeating groups
- ✅ Each column has unique name

**2nd Normal Form (2NF):**
- ✅ All non-key attributes fully dependent on primary key
- ✅ No partial dependencies

**3rd Normal Form (3NF):**
- ✅ No transitive dependencies
- ✅ All non-key attributes depend only on primary key

### Example: Student Data Normalization

**Before (Denormalized):**
```
student_id | name | email | class_name | teacher_name | room
```

**After (3NF):**
```
users: user_id | email | password_hash | role
students: student_id | user_id | first_name | last_name | year | semester
classes: class_id | name | year | semester | room_number | teacher_id
enrollments: enrollment_id | student_id | class_id
```

---

## 🔐 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/change-password
```

### Students (Protected)
```
GET    /api/students              # List all (with filters)
GET    /api/students/:id          # Get single student
POST   /api/students              # Create (Admin only)
PUT    /api/students/:id          # Update (Admin only)
DELETE /api/students/:id          # Delete (Admin only)
GET    /api/students/:id/attendance
```

### Faculty (Protected)
```
GET    /api/faculty               # List all (with filters)
GET    /api/faculty/:id           # Get single faculty
POST   /api/faculty               # Create (Admin only)
PUT    /api/faculty/:id           # Update (Admin only)
PUT    /api/faculty/:id/password  # Update password (Admin only)
DELETE /api/faculty/:id           # Delete (Admin only)
```

### Classes (Protected)
```
GET    /api/classes               # List all
GET    /api/classes/:id           # Get single class
POST   /api/classes               # Create (Admin only)
PUT    /api/classes/:id           # Update (Admin only)
DELETE /api/classes/:id           # Delete (Admin only)
GET    /api/classes/:id/students  # Get enrolled students
```

---

## 🔄 Migration from Mock Data

### What Changed:

**Before:**
- ❌ Mock data in `src/data/mockData.ts`
- ❌ Local state management only
- ❌ No persistence
- ❌ No authentication

**After:**
- ✅ Real MySQL database
- ✅ RESTful API backend
- ✅ JWT authentication
- ✅ Persistent data storage
- ✅ Role-based access control

### Next Steps to Complete Migration:

1. **Update Frontend Components:**
   - Replace `mockStudents` imports with `studentService` calls
   - Replace `mockStaff` with `facultyService` calls
   - Replace `mockClasses` with `classService` calls
   - Add loading states and error handling

2. **Example Update Pattern:**

**Before:**
```typescript
import { mockStudents } from '../../data/mockData';
const [students, setStudents] = useState(mockStudents);
```

**After:**
```typescript
import { studentService } from '../../services/studentService';

const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchStudents = async () => {
        try {
            const data = await studentService.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchStudents();
}, []);
```

---

## 📁 Project Structure

```
sietcse/
├── server/                      # Backend
│   ├── config/
│   │   └── database.js         # MySQL connection
│   ├── database/
│   │   └── schema.sql          # Database schema
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── students.js         # Student routes
│   │   ├── faculty.js          # Faculty routes
│   │   └── classes.js          # Class routes
│   ├── .env                    # Environment config
│   ├── package.json
│   ├── server.js               # Main server file
│   └── README.md
│
├── src/                        # Frontend
│   ├── services/               # API service layer
│   │   ├── api.ts              # Axios instance
│   │   ├── authService.ts
│   │   ├── studentService.ts
│   │   ├── facultyService.ts
│   │   └── classService.ts
│   ├── components/
│   ├── pages/
│   └── types/
│
├── .env                        # Frontend env
├── SETUP_GUIDE.md             # Complete setup guide
└── README.md                   # This file
```

---

## ✨ Key Features

### Security
- ✅ Bcrypt password hashing (10 rounds)
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection

### Data Integrity
- ✅ Foreign key constraints
- ✅ Cascade delete operations
- ✅ Transaction support
- ✅ Unique constraints (email, USN)
- ✅ Data validation

### Performance
- ✅ Database connection pooling
- ✅ Indexed columns
- ✅ Efficient queries
- ✅ Pagination ready

---

## 🧪 Testing the API

### Using curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cse","password":"admin123"}'

# Get students (replace TOKEN)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create student
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "temp123",
    "usn": "1SI23CS001",
    "firstName": "John",
    "lastName": "Doe",
    "year": 2,
    "semester": 3,
    "section": "A"
  }'
```

---

## 🎓 Database Best Practices Implemented

1. **Naming Conventions:**
   - Tables: plural, lowercase (students, faculty)
   - Columns: snake_case (first_name, class_teacher_id)
   - Primary keys: id (auto-increment)
   - Foreign keys: {table}_id (user_id, class_id)

2. **Data Types:**
   - VARCHAR for variable text
   - INT for numbers
   - ENUM for fixed options
   - DECIMAL for precise numbers (marks)
   - TIMESTAMP for dates

3. **Constraints:**
   - PRIMARY KEY on all tables
   - FOREIGN KEY with ON DELETE actions
   - UNIQUE constraints where needed
   - CHECK constraints for validation
   - NOT NULL for required fields

4. **Indexes:**
   - Primary keys auto-indexed
   - Foreign keys indexed
   - Frequently queried columns indexed
   - Composite indexes for multi-column queries

---

## 📝 TODO: Frontend Integration

To complete the migration, update these components:

- [ ] `src/pages/admin/StudentList.tsx` - Use studentService
- [ ] `src/pages/admin/FacultyList.tsx` - Use facultyService  
- [ ] `src/pages/admin/Academics.tsx` - Use classService
- [ ] `src/pages/Login.tsx` - Use authService
- [ ] `src/components/admin/StudentForm.tsx` - API integration
- [ ] `src/components/admin/FacultyForm.tsx` - API integration
- [ ] `src/pages/admin/Dashboard.tsx` - Real-time data

---

## 🆘 Troubleshooting

See `SETUP_GUIDE.md` for detailed troubleshooting steps.

**Common Issues:**
- Database connection failed → Check MySQL credentials in `.env`
- Port already in use → Change PORT in `.env`
- 401 Unauthorized → Token expired, login again
- CORS errors → Verify FRONTEND_URL in backend `.env`

---

## 📞 Support

For detailed setup instructions, see: **`SETUP_GUIDE.md`**

---

**🎉 Backend is ready! Now integrate the frontend components with the API services.**
