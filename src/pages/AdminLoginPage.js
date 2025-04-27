import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (token === '159753456hang0ver') {
      // Eğer token doğruysa, admin paneline yönlendir
      localStorage.setItem('adminToken', token);  // Token'ı localStorage'a kaydediyoruz
      navigate('/admin');  // Admin paneline yönlendir
    } else {
      // Hatalı token girildi
      setError(true);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <h1>Admin Panel Girişi</h1>

        {/* Hata mesajı */}
        {error && <div className="error-message">Geçersiz token, tekrar deneyin.</div>}

        <input
          type="text"
          placeholder="Admin Panel Token'ı"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="token-input"
        />
        <button onClick={handleSubmit} className="login-button">
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
