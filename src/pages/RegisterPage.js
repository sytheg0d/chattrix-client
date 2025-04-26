import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const register = async () => {
    try {
      const res = await axios.post('http://localhost:3001/register', {
        username: nickname,
        password,
      });

      if (res.data.success) {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        navigate('/login');
      }
    } catch (err) {
      alert('Kayıt başarısız. Kullanıcı adı alınmış olabilir.');
    }
  };

  return (
    <div className="login-container">
      <h1 className="glitch">CHATTRIX</h1>
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
        <button onClick={register}>Kayıt Ol</button>
        <Link to="/login">
          <button>Geri Dön</button>
        </Link>
      </div>
    </div>
  );
}
