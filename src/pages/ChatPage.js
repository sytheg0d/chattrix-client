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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const nickname = localStorage.getItem('nickname');
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

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('receive_message');
      socket.off('update_users');
    };
  }, [nickname, navigate]);

  const handleBeforeUnload = () => {
    // Siteyi kapatırken sadece kullanıcıyı offline yapıyoruz.
    if (nickname) {
      socket.emit('logout', nickname);
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [chat]);

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

  const logout = () => {
    socket.emit('logout', nickname); // Gerçekten socketten çıkış sinyali gönder
    localStorage.removeItem('nickname'); // nickname bilgisini temizle
    navigate('/login'); // login sayfasına yönlendir
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

  const getUserThemeColor = (sender) => {
    const user = users.find((u) => u.username === sender);
    if (!user || !user.currentTheme) return '#00ff00'; 

    if (user.currentTheme === 'white') return 'white';
    if (user.currentTheme === 'lightblue') return 'lightblue';
    if (user.currentTheme === 'rainbow') return 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
    return '#00ff00';
  };

  return (
    <div className="chat-layout">
      <div className="top-header">
        <div className="logo">CHATTRIX</div>
        <div className="menu" style={{ position: 'relative' }}>
          <span onClick={() => navigate('/market')} style={{ cursor: 'pointer', marginRight: '20px', background: '#0a0a0a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #00ff00', color: '#00ff00' }}>Global Market</span>
          <span onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{ cursor: 'pointer', background: '#0a0a0a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #00ff00', color: '#00ff00' }}>Profil</span>

          {profileMenuOpen && (
            <div className="profile-menu" style={{ position: 'absolute', right: 0, top: '50px', background: '#0a0a0a', border: '1px solid #00ff00', borderRadius: '8px', overflow: 'hidden', animation: 'fadeIn 0.3s' }}>
              <div className="profile-menu-item" onClick={() => alert('Profili düzenleme yakında aktif!')} style={{ padding: '10px', cursor: 'pointer', color: '#00ff00', textAlign: 'center' }}>Profili Düzenle</div>
              <div className="profile-menu-item" onClick={logout} style={{ padding: '10px', cursor: 'pointer', color: '#ff4444', textAlign: 'center' }}>Logout</div>
            </div>
          )}
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
                  style={{ 
                    color: c.sender === 'Sistem' ? '#ff4444' : (getUserThemeColor(c.sender) === 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' 
                      ? undefined 
                      : getUserThemeColor(c.sender)),
                    background: getUserThemeColor(c.sender) === 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' ? 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' : undefined,
                    WebkitBackgroundClip: getUserThemeColor(c.sender) === 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' ? 'text' : undefined,
                    color: getUserThemeColor(c.sender) === 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' ? 'transparent' : undefined
                  }}
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
    </div>
  );
}
