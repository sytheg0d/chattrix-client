import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function MarketPage() {
  const navigate = useNavigate();
  const [marketItems, setMarketItems] = useState([]);
  const [credits, setCredits] = useState(0);
  const [currentTheme, setCurrentTheme] = useState('default');
  const nickname = localStorage.getItem('nickname');

  useEffect(() => {
    fetchMarket();
    fetchUserData();
  }, []);

  const fetchMarket = async () => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/market');
      const data = await response.json();
      const items = Object.keys(data).map((key) => ({
        name: key,
        ...data[key]
      }));
      setMarketItems(items);
    } catch (err) {
      console.error('Market verileri çekilemedi:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/get-users');
      const users = await response.json();
      const currentUser = users.find((u) => u.username === nickname);
      if (currentUser) {
        setCredits(currentUser.credits || 0);
        setCurrentTheme(currentUser.currentTheme || 'default');
      }
    } catch (err) {
      console.error('Kullanıcı verisi çekilemedi:', err);
    }
  };

  const buyTheme = async (themeName) => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/buy-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname, theme: themeName })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchUserData();
      } else {
        alert(result.message || 'Satın alma başarısız.');
      }
    } catch (err) {
      console.error('Satın alma hatası:', err);
    }
  };

  const selectTheme = async (themeName) => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/update-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname, theme: themeName })
      });
      const result = await response.json();
      if (result.success) {
        alert('Tema değiştirildi!');
        setCurrentTheme(themeName);
      } else {
        alert('Tema değiştirilemedi.');
      }
    } catch (err) {
      console.error('Tema değiştirme hatası:', err);
    }
  };

  const getThemeColor = (name) => {
    switch (name.toLowerCase()) {
      case 'rainbow':
        return {
          background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        };
      case 'white':
        return { color: 'white' };
      case 'lightblue':
        return { color: 'lightblue' };
      default:
        return { color: '#00ff00' };
    }
  };

  return (
    <div className="chat-layout">
      {/* Navbar */}
      <div className="top-header">
        <div className="logo">CHATTRIX</div>
        <div className="menu">
          <span onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>Global Chat</span>
          <span onClick={() => navigate('/market')} style={{ cursor: 'pointer' }}>Global Market</span>
        </div>
      </div>

      {/* Market Alanı */}
      <div className="market-page" style={{ padding: '20px' }}>
        <h2 style={{ color: '#00ff00', marginBottom: '10px' }}>Market</h2>
        <p style={{ color: '#00ff00' }}>Mevcut Krediniz: {credits}</p>

        <h3 style={{ color: '#00ff00', marginTop: '30px' }}>Mesaj Temaları</h3>

        <div className="market-items" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          {marketItems.map((item, index) => (
            <div key={index} className="market-item" style={{
              border: '2px solid #00ff00',
              padding: '20px',
              borderRadius: '10px',
              background: '#0a0a0a',
              width: '250px',
              textAlign: 'center',
              boxShadow: '0 0 10px #00ff00'
            }}>
              <h4 style={{ ...getThemeColor(item.name), marginBottom: '10px' }}>{item.name.toUpperCase()}</h4>
              <p style={{ color: '#ccc' }}>{item.description}</p>
              <p style={{ color: '#00ff00', fontWeight: 'bold' }}>Fiyat: {item.price} kredi</p>

              {currentTheme === item.name ? (
                <button style={{
                  marginTop: '10px',
                  backgroundColor: '#555',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'default'
                }} disabled>Seçili</button>
              ) : (
                <button style={{
                  marginTop: '10px',
                  backgroundColor: '#00ff00',
                  color: 'black',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }} onClick={() => {
                  if (credits >= item.price || item.price === 0) {
                    buyTheme(item.name);
                  } else {
                    selectTheme(item.name);
                  }
                }}>
                  {credits >= item.price ? 'Satın Al' : 'Seç'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
