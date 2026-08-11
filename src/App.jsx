import React from 'react';
import { SocketProvider } from './context/SocketContext';
import StudentApp from './components/student/StudentApp';
import AdminDashboard from './components/admin/AdminDashboard';
import './styles/index.css';
import './styles/student.css';
import './styles/admin.css';

export default function App() {
  // Simple clean router: check if URL query includes ?admin=true or pathname is /admin
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true' || window.location.pathname.startsWith('/admin');

  return (
    <SocketProvider>
      {isAdmin ? <AdminDashboard /> : <StudentApp />}
    </SocketProvider>
  );
}
