import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { io } from 'socket.io-client';

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

  const sendMessage = () => {
    if (message.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    socket.emit('send_message', { sender: nickname, message, timestamp });
    setMessage('');
  };

  const formatUsername = (username) => {
    if (username.toLowerCase() === 'hang0ver') {
      return <span style={{ color: 'gold' }}>[GOD]</span>;
    }
    if (username.startsWith('[ADMIN] ')) {
      return <span style={{ color: 'white' }}>[ADMIN]</span>;
    }
    if (username.startsWith('[MOD] ')) {
      return <span style={{ color: 'white' }}>[MOD]</span>;
    }
    return null;
  };
  
  const displayName = (name) => {
    if (name.toLowerCase() === 'hang0ver') {
      return (
        <>
          <span style={{ color: 'gold' }}>[GOD]</span> @{name}
        </>
      );
    }
    if (name.startsWith('[ADMIN] ')) {
      const pureName = name.replace('[ADMIN] ', '');
      return (
        <>
          <span style={{ color: 'white' }}>[ADMIN]</span> @{pureName}
        </>
      );
    }
    if (name.startsWith('[MOD] ')) {
      const pureName = name.replace('[MOD] ', '');
      return (
        <>
          <span style={{ color: 'white' }}>[MOD]</span> @{pureName}
        </>
      );
    }
    return <>@{name}</>;
  };

  return (
    <div className="chat-layout">
      <div className="top-header">
        <div className="logo">CHATTRIX</div>
        <div className="menu">
          <span>Global Market</span>
          <span>Profil</span>
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
            {chat.map((c, i) => (
              <p key={i} className={c.sender === 'Sistem' ? 'system' : ''}>
                <span className="timestamp">[{c.timestamp}]</span>{' '}
                <strong>{displayName(c.sender)} ➤</strong> {c.message}
              </p>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Mesaj yaz..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button onClick={sendMessage}>Gönder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
