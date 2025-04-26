import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import { io } from 'socket.io-client';

// ✅ Dinamik socket bağlantısı
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
  const messageEndRef = useRef(null); // 📌 Scroll için referans

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

    return () => {
      socket.off('receive_message');
      socket.off('update_users');
    };
  }, [nickname, navigate]);

  // 📌 Mesaj gelince otomatik aşağı scroll
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      socket.emit('send_message', { sender: nickname, message, timestamp });
      setMessage('');
    }
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
            <p key={i}>@{user}</p>
          ))}
        </div>

        <div className="chat-section">
          <h3>Global Chat</h3>

          <div className="message-box">
            {chat.map((c, i) => (
              <p key={i} className={c.sender === 'Sistem' ? 'system' : ''}>
                <span className="timestamp">[{c.timestamp}]</span>{' '}
                <strong>@{c.sender} ➤</strong> {c.message}
              </p>
            ))}
            {/* 📌 Scroll'un sonu */}
            <div ref={messageEndRef} />
          </div>

          <div className="input-row">
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
