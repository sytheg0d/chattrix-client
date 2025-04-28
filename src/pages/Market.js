import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

export default function MarketPage() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState({});
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const nickname = JSON.parse(localStorage.getItem('nickname')) || null;

  useEffect(() => {
    if (!nickname) {
      navigate('/login');
      return;
    }
    fetchMarket();
    fetchUserCredits();
  }, []);

  const fetchMarket = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/market');
      setThemes(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Market verileri alınamadı:', error);
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/get-users');
      const user = res.data.find(u => u.username === nickname);
      if (user) setUserCredits(user.credits);
    } catch (error) {
      console.error('Kullanıcı kredisi alınamadı:', error);
    }
  };

  const buyTheme = async (themeName) => {
    try {
      const res = await axios.post('https://chattrix-server.onrender.com/buy-theme', {
        username: nickname,
        theme: themeName
      });
  
      if (res.data.success) {
        alert(res.data.message);
        fetchUserCredits(); // Kredi güncellemesi
        localStorage.setItem('activeTheme', JSON.stringify(themeName)); // Aktif temayı kaydet
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error('Tema satın alma hatası:', err);
      alert('Satın alma başarısız oldu.');
    }
  };
  
  return (
    <div className="market-page">
      <h1>Global Market</h1>

      <p><strong>Kredileriniz:</strong> {userCredits} 💰</p>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="market-grid">
          {Object.entries(themes).map(([themeName, themeData]) => (
            <div key={themeName} className="market-item">
              <h2>{themeName.toUpperCase()}</h2>
              <p>{themeData.description}</p>
              <p><strong>Fiyat:</strong> {themeData.price} 💰</p>
              <button onClick={() => buyTheme(themeName)}>Satın Al</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
