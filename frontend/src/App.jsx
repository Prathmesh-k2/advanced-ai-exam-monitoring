import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import ExamResults from './pages/ExamResults';
import StudentDashboard from './pages/StudentDashboard';
import TakeExam from './pages/TakeExam';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/create-exam" element={
            <ProtectedRoute roleRequired="admin"><CreateExam /></ProtectedRoute>
          } />
          <Route path="/admin/edit-exam/:id" element={
            <ProtectedRoute roleRequired="admin"><EditExam /></ProtectedRoute>
          } />
          <Route path="/admin/exam/:id/results" element={
            <ProtectedRoute roleRequired="admin"><ExamResults /></ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute roleRequired="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/exam/:id" element={
            <ProtectedRoute roleRequired="student"><TakeExam /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
