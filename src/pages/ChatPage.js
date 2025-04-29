import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { io } from 'socket.io-client';
import { Plus } from 'lucide-react';

const socket = io(
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://chattrix-server.onrender.com'
);

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const [marketVisible, setMarketVisible] = useState(false);
  const [marketItems, setMarketItems] = useState({});
  const [userTheme, setUserTheme] = useState('default');
  const nickname = location.state?.nickname;
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!nickname) {
      navigate('/login');
      return;
    }

    socket.emit('join', nickname);

    socket.on('receive_message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on('update_users', (userList) => {
      setUsers(userList);
    });

    fetchUserTheme();

    const handleBeforeUnload = () => {
      socket.emit('logout', nickname);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.emit('logout', nickname);
      socket.off('receive_message');
      socket.off('update_users');
    };
  }, [nickname, navigate]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const fetchUserTheme = async () => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/get-users');
      const users = await response.json();
      const currentUser = users.find((u) => u.username === nickname);
      if (currentUser && currentUser.currentTheme) {
        setUserTheme(currentUser.currentTheme);
      }
    } catch (err) {
      console.error('Kullanıcı teması çekilemedi:', err);
    }
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    socket.emit('send_message', { sender: nickname, message, timestamp });
    setMessage('');
  };

  const uploadImage = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result.split(',')[1];
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      socket.emit('send_message', {
        sender: nickname,
        message: `data:${file.type};base64,${imageBase64}`,
        timestamp,
      });
    };
    reader.readAsDataURL(file);
  };

  const displayName = (user) => {
    if (!user || !user.username) return null;

    if (user.username.toLowerCase() === 'hang0ver') {
      return (
        <>
          <span style={{ color: 'gold' }}>[GOD]</span> @{user.username}
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <span style={{ color: 'white' }}>[ADMIN]</span> @{user.username}
        </>
      );
    }

    if (user.role === 'moderator') {
      return (
        <>
          <span style={{ color: 'white' }}>[MOD]</span> @{user.username}
        </>
      );
    }

    return <>@{user.username}</>;
  };

  const displayMessageSender = (sender) => {
    if (!sender) return null;

    const user = users.find((u) => u.username === sender);

    if (sender.toLowerCase() === 'hang0ver') {
      return (
        <>
          <span style={{ color: 'gold' }}>[GOD]</span> @{sender}
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <span style={{ color: 'white' }}>[ADMIN]</span> @{sender}
        </>
      );
    }

    if (user?.role === 'moderator') {
      return (
        <>
          <span style={{ color: 'white' }}>[MOD]</span> @{sender}
        </>
      );
    }

    return <>@{sender}</>;
  };

  const fetchMarket = async () => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/market');
      const data = await response.json();
      setMarketItems(data);
      setMarketVisible(true);
    } catch (err) {
      console.error('Market çekilemedi:', err);
    }
  };

  const buyTheme = async (theme) => {
    try {
      const response = await fetch('https://chattrix-2ur3.onrender.com/buy-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname, theme }),
      });
      const result = await response.json();
      alert(result.message || 'Satın alma işlemi tamamlandı.');
      if (result.success) {
        setUserTheme(theme); // Satın aldıysa güncelle
      }
    } catch (err) {
      console.error('Tema satın alma hatası:', err);
    }
  };

  const getMessageStyle = (theme) => {
    if (theme === 'rainbow') {
      return {
        background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      };
    }
    if (theme === 'lightblue') return { color: 'lightblue' };
    if (theme === 'white') return { color: 'white' };
    return { color: '#00ff00' }; // Default hacker yeşili
  };

  return (
    <div className="chat-layout">
      <div className="top-header">
        <div className="logo">CHATTRIX</div>
        <div className="menu">
          <span onClick={fetchMarket} style={{ cursor: 'pointer' }}>Global Market</span>
          <span style={{ cursor: 'pointer' }}>Profil</span>
        </div>
      </div>

      <div className="main-section">
        <div className="user-list">
          <h3>Online Users</h3>
          {users.map((user, i) => (
            <p key={i}>{displayName(user)}</p>
          ))}
        </div>

        <div className="chat-section">
          <h3>Global Chat</h3>

          <div className="chat-messages">
            <div className="messages-container">
              {chat.map((c, i) => (
                <p
                  key={i}
                  className={c.sender === 'Sistem' ? 'system' : ''}
                  style={c.sender === 'Sistem' ? { color: 'red' } : getMessageStyle(c.theme)}
                >
                  <span className="timestamp">[{c.timestamp}]</span>{' '}
                  <strong>{displayMessageSender(c.sender)} ➤</strong>{' '}
                  {c.message.startsWith('data:image') ? (
                    <img
                      src={c.message}
                      alt="gönderilen resim"
                      style={{ maxWidth: '300px', maxHeight: '300px', border: '1px solid #00ff00', marginTop: '5px' }}
                    />
                  ) : (
                    <span>{c.message}</span>
                  )}
                </p>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="chat-input">
            <label htmlFor="file-upload" className="upload-icon">
              <Plus size={24} />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => uploadImage(e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Mesaj yaz..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              className="message-input"
            />
            <button onClick={sendMessage} className="send-button">Gönder</button>
          </div>
        </div>
      </div>

      {marketVisible && (
        <div className="market-popup">
          <div className="market-content">
            <h3>Global Market</h3>
            <button onClick={() => setMarketVisible(false)}>Kapat</button>
            {Object.entries(marketItems).map(([key, item], idx) => (
              <div key={idx} className="market-item">
                <h4>{key.toUpperCase()}</h4>
                <p>{item.description}</p>
                <p>Fiyat: {item.price} kredi</p>
                <button onClick={() => buyTheme(key)}>Satın Al</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
