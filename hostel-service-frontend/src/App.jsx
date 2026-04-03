import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import SicDashboard from './pages/SicDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Navigation() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center text-white font-bold">
        Initializing HostelHub...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route 
        path="/" 
        element={
          !user ? <Navigate to="/login" /> : 
          user.role === 'admin' ? <Navigate to="/admin-dashboard" /> :
          user.role === 'sic' ? <Navigate to="/sic-dashboard" /> :
          <Navigate to="/student-dashboard" />
        } 
      />

      <Route 
        path="/sic-dashboard" 
        element={user?.role === 'sic' ? <SicDashboard /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/student-dashboard" 
        element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/admin-dashboard" 
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}