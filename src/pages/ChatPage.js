import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { io } from 'socket.io-client';
import { Plus } from 'lucide-react'; // + simgesi için

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

  const getUserTheme = (sender) => {
    const activeTheme = JSON.parse(localStorage.getItem('activeTheme'));
    if (!activeTheme) return null;

    if (sender === nickname) {
      return activeTheme;
    }

    return null;
  };

  const sendMessage = () => {
    if (message.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const activeTheme = JSON.parse(localStorage.getItem('activeTheme')) || null;

    socket.emit('send_message', { 
      sender: nickname, 
      message, 
      timestamp,
      theme: activeTheme // Temayı da gönderiyoruz
    });

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

      const activeTheme = JSON.parse(localStorage.getItem('activeTheme')) || null;

      socket.emit('send_message', {
        sender: nickname,
        message: `data:${file.type};base64,${imageBase64}`,
        timestamp,
        theme: activeTheme // Resim gönderirken de temayı ekliyoruz
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

    if (sender.toLowerCase() === 'hang0ver') {
      return (
        <>
          <span style={{ color: 'gold' }}>[GOD]</span> @{sender}
        </>
      );
    }

    return <>@{sender}</>;
  };

  return (
    <div className="chat-layout">
      <div className="top-header">
        <div className="logo">CHATTRIX</div>
        <div className="menu">
          <span onClick={() => navigate('/market')}>Global Market</span>
          <span onClick={() => navigate('/profile')}>Profil</span>
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
            {chat.map((c, i) => {
              const theme = c.theme || null; // Gelen mesajdaki tema bilgisi

              return (
                <p 
                  key={i} 
                  className={c.sender === 'Sistem' ? 'system' : ''}
                  style={ 
                    theme === 'rainbow' ? {
                      background: 'linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold'
                    } 
                    : theme === 'white' ? {
                      color: '#ffffff'
                    } 
                    : theme === 'lightblue' ? {
                      color: '#00ccff'
                    } 
                    : {}
                  }
                >
                  <span className="timestamp">[{c.timestamp}]</span>{' '}
                  <strong>{displayMessageSender(c.sender)} ➤</strong> {c.message}
                </p>
              );
            })}
            <div ref={messageEndRef} />
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
