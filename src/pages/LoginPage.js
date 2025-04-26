import '../App.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post('https://chattrix-server.onrender.com/login', {
        username: nickname,
        password,
      });

      if (res.data.success) {
        navigate('/chat', { state: { nickname } });
      }
    } catch (err) {
      alert('Giriş başarısız.');
    }
  };

  return (
    <div className="login-container">
      <h1 className="glitch">CHATTRIX</h1>
      <p className="warning">Şifre sıfırlama yoktur. Bilgilerinizi unutmayın!</p>
      <input
        type="text"
        placeholder="Kullanıcı Adı"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="button-group">
        <button onClick={login}>Giriş Yap</button>
        <Link to="/register">
          <button>Hesap Oluştur</button>
        </Link>
      </div>
    </div>
  );
}
