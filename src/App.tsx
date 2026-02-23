import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { Academics } from './pages/admin/Academics';
import { FacultyList } from './pages/admin/FacultyList';
import { StudentList } from './pages/admin/StudentList';
import { AdminTimetable } from './pages/admin/AdminTimetable';
import { ExamManagement } from './pages/admin/ExamManagement';
import { MySchedule } from './pages/staff/MySchedule';
import { Attendance } from './pages/staff/Attendance';
import { MarksEntry } from './pages/staff/MarksEntry';
import { StaffDashboard } from './pages/staff/Dashboard';
import { StaffExamGrades } from './pages/staff/ExamGrades';
import { StudentDashboard } from './pages/student/Dashboard';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            {/* Admin + HOD Routes — HOD has full Super Admin access */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'hod']} />}>
              <Route path="admin/timetable" element={<AdminTimetable />} />
              <Route path="admin/exams" element={<ExamManagement />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/faculty" element={<FacultyList />} />
              <Route path="admin/students" element={<StudentList />} />
              <Route path="admin/academics" element={<Academics />} />
              <Route path="admin/profile" element={<Profile />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="staff" element={<StaffDashboard />} />
              <Route path="staff/dashboard" element={<StaffDashboard />} />
              <Route path="staff/schedule" element={<MySchedule />} />
              <Route path="staff/exam-grades" element={<StaffExamGrades />} />
              <Route path="staff/attendance" element={<Attendance />} />
              <Route path="staff/marks" element={<MarksEntry />} />
              <Route path="staff/profile" element={<Profile />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="student" element={<StudentDashboard />} />
              <Route path="student/subjects" element={<StudentDashboard view="subjects" />} />
              <Route path="student/today" element={<StudentDashboard view="today" />} />
              <Route path="student/timetable" element={<StudentDashboard view="timetable" />} />
              <Route path="student/exams" element={<StudentDashboard view="exams" />} />
              <Route path="student/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
