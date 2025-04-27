import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage'; // ✅ AdminPage import edildi
import AdminLoginPage from './pages/AdminLoginPage'; // ✅ AdminLoginPage import edildi

function App() {
  return (
    <Router>
      <Routes>
        {/* Varsayılan olarak login sayfasına yönlendir */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login Sayfası */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Register Sayfası */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Chat Sayfası */}
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Admin Login Sayfası */}
        <Route path="/admin-login" element={<AdminLoginPage />} /> {/* Admin login sayfası eklendi */}
        
        {/* Admin Panel Sayfası */}
        <Route path="/admin" element={<AdminPage />} /> {/* Admin paneli */}
      </Routes>
    </Router>
  );
}

export default App;
