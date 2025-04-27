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
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#00ff00', minHeight: '100vh' }}>
      <h1>Admin Panel Girişi</h1>

      {/* Hata mesajı */}
      {error && <div style={{ color: 'red' }}>Geçersiz token, tekrar deneyin.</div>}

      <input
        type="text"
        placeholder="Admin Panel Token'ı"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ backgroundColor: '#111', color: '#00ff00', border: '1px solid #00ff00', padding: '10px', width: '100%' }}
      />
      <button onClick={handleSubmit} style={{ marginTop: '10px', backgroundColor: '#00ff00', color: '#000', border: 'none', padding: '10px', cursor: 'pointer' }}>
        Giriş Yap
      </button>
    </div>
  );
}
