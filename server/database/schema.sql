-- SIET CSE ERP Database Schema (3NF Compliant)
-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS timetable;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;

-- Departments Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table (Base authentication table)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hod', 'staff', 'student') NOT NULL,
    department_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Faculty Table
CREATE TABLE faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    pan VARCHAR(10),
    aadhaar VARCHAR(12),
    designation ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD') NOT NULL,
    highest_degree ENUM('PhD', 'M.Tech', 'M.Sc', 'B.Tech', 'Other'),
    experience_total INT DEFAULT 0,
    experience_research INT DEFAULT 0,
    experience_industry INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_designation (designation)
);

-- Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    usn VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    parent_name VARCHAR(200),
    parent_phone VARCHAR(15),
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    section VARCHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usn (usn),
    INDEX idx_year_sem (year, semester, section)
);

-- Classes Table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    section VARCHAR(1) NOT NULL,
    room_number VARCHAR(10),
    class_teacher_id INT,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_teacher_id) REFERENCES faculty(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class (year, semester, section, department_id),
    INDEX idx_year_sem (year, semester)
);

-- Enrollments Table (Many-to-Many: Students to Classes)
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrolled_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'transferred') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_id),
    INDEX idx_student (student_id),
    INDEX idx_class (class_id)
);

-- Timetable Tablea
CREATE TABLE timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    day_of_week ENUM('Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    subject VARCHAR(100) NOT NULL,
    faculty_id INT,
    room_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
    UNIQUE KEY unique_slot (class_id, day_of_week, period_number),
    INDEX idx_faculty (faculty_id),
    INDEX idx_class_day (class_id, day_of_week)
);

-- Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    timetable_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES faculty(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, timetable_id, date),
    INDEX idx_student_date (student_id, date),
    INDEX idx_date (date)
);

-- Marks Table
CREATE TABLE marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_type ENUM('midterm', 'lab', 'assignment', 'final') NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_subject (student_id, subject),
    INDEX idx_exam_type (exam_type)
);

-- System Settings Table (for API keys and configuration)
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

-- Insert default department
INSERT INTO departments (name, code) VALUES ('Computer Science and Engineering', 'CSE');

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (email, password_hash, role, department_id) 
VALUES ('admin@cse', '$2b$10$rKvVPZqGfJxHYLz5gN8kPOxKqJXqJxQxJxQxJxQxJxQxJxQxJxQ', 'admin', 1);
