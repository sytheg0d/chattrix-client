import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Tema stilleri burada tanımlıysa

export default function Market() {
  const [themes, setThemes] = useState({});
  const [userCredits, setUserCredits] = useState(0);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    // Kullanıcının nickname'ini ve kredilerini localStorage'dan veya başka yerden al
    const storedNickname = localStorage.getItem('nickname');
    const storedCredits = parseInt(localStorage.getItem('credits'), 10);
    setNickname(storedNickname || '');
    setUserCredits(storedCredits || 0);

    // Market verisini çek
    axios.get('https://chattrix-server.onrender.com/market')
      .then(res => {
        setThemes(res.data);
      })
      .catch(err => {
        console.error('❌ Market verisi çekilemedi:', err);
      });
  }, []);

  const buyTheme = (themeName) => {
    axios.post('https://chattrix-server.onrender.com/buy-theme', {
      username: nickname,
      theme: themeName
    })
    .then(res => {
      alert(res.data.message);
      setUserCredits(prev => prev - themes[themeName].price); // Krediden düş
    })
    .catch(err => {
      console.error('❌ Satın alma hatası:', err);
      alert('Satın alma başarısız oldu.');
    });
  };

  return (
    <div className="market-container">
      <h1>Market</h1>
      <p>Mevcut Krediniz: <strong>{userCredits}</strong></p>

      <div className="themes-grid">
        {Object.entries(themes).map(([themeName, themeInfo]) => (
          <div key={themeName} className="theme-card">
            <h2>{themeName.toUpperCase()}</h2>
            <p>{themeInfo.description}</p>
            <p>Fiyat: {themeInfo.price} kredi</p>
            <button onClick={() => buyTheme(themeName)}>Satın Al</button>
          </div>
        ))}
      </div>
    </div>
  );
}