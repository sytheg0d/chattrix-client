import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [roles, setRoles] = useState({});

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/get-users');
      setUsers(res.data);
      const initialRoles = {};
      res.data.forEach(user => {
        initialRoles[user.username] = user.role;
      });
      setRoles(initialRoles);
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Loglar alınamadı:', err);
    }
  };

  const fetchBannedIps = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/banned-ips');
      setBannedIps(res.data);
    } catch (err) {
      console.error('Banlı IPler alınamadı:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchBannedIps();

    const interval = setInterval(() => {
      fetchLogs();
      fetchBannedIps();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const updateRole = async (username) => {
    try {
      await axios.post('https://chattrix-server.onrender.com/update-role', {
        username,
        newRole: roles[username]
      });
      fetchUsers();
    } catch (err) {
      console.error('Rol güncellenemedi:', err);
    }
  };

  const deleteUser = async (username) => {
    if (window.confirm(`${username} adlı kullanıcıyı silmek istiyor musun?`)) {
      try {
        await axios.post('https://chattrix-server.onrender.com/delete-user', { username });
        fetchUsers();
      } catch (err) {
        console.error('Kullanıcı silinemedi:', err);
      }
    }
  };

  const unbanIp = async (ip) => {
    if (window.confirm(`${ip} IP adresinin banını kaldırmak istiyor musun?`)) {
      try {
        await axios.post('https://chattrix-server.onrender.com/unban-ip', { ip });
        fetchBannedIps();
      } catch (err) {
        console.error('Ban kaldırılamadı:', err);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#00ff00', minHeight: '100vh' }}>
      <h1>Admin Panel</h1>

      {/* Kullanıcılar Tablosu */}
      <h2>Kullanıcılar</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>Kullanıcı Adı</th>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>Rol</th>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td style={{ border: '1px solid #00ff00', padding: '8px' }}>@{user.username}</td>
              <td style={{ border: '1px solid #00ff00', padding: '8px' }}>
                <select
                  value={roles[user.username] || 'user'}
                  onChange={(e) => setRoles({ ...roles, [user.username]: e.target.value })}
                  style={{ backgroundColor: '#000', color: '#00ff00', border: '1px solid #00ff00' }}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td style={{ border: '1px solid #00ff00', padding: '8px' }}>
                <button
                  onClick={() => updateRole(user.username)}
                  style={{ marginRight: '10px', backgroundColor: '#00ff00', color: '#000', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Rolü Güncelle
                </button>
                <button
                  onClick={() => deleteUser(user.username)}
                  style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Kullanıcıyı Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Banlı IP'ler Tablosu */}
      <h2>Banlı IP'ler</h2>
      <div style={{ marginBottom: '30px', backgroundColor: '#111', padding: '15px', border: '1px solid #00ff00', maxHeight: '200px', overflowY: 'auto' }}>
        {bannedIps.map(ip => (
          <div key={ip._id} style={{ marginBottom: '10px' }}>
            {ip.ip}
            <button
              onClick={() => unbanIp(ip.ip)}
              style={{ marginLeft: '10px', backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
            >
              Banı Kaldır
            </button>
          </div>
        ))}
      </div>

      {/* Giriş / Çıkış Logları */}
      <h2>Giriş / Çıkış Logları</h2>
      <div style={{
        backgroundColor: '#111',
        padding: '15px',
        border: '1px solid #00ff00',
        maxHeight: '300px',
        overflowY: 'scroll',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px'
      }}>
        {logs.map(log => (
          <div key={log._id}>
            [{log.timestamp}] ➤ {log.username} ({log.type.toUpperCase()}) IP: {log.ip}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  // Doğru token ile giriş kontrolü
  const handleSubmit = () => {
    if (token === '159753456hang0ver') {
      // Token doğruysa admin paneline geçiş yap
      navigate('/admin-panel');
    } else {
      // Hatalı token
      setError(true);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#00ff00', minHeight: '100vh' }}>
      <h1>Admin Panel Girişi</h1>
      
      {/* Hata mesajı */}
      {error && <div style={{ color: 'red' }}>Geçersiz token, tekrar deneyin.</div>}
      
      <input 
        type="text" 
        placeholder="Admin Panel Token'ı" 
        value={token} 
        onChange={(e) => setToken(e.target.value)} 
        style={{ backgroundColor: '#111', color: '#00ff00', border: '1px solid #00ff00', padding: '10px', width: '100%' }} 
      />
      <button onClick={handleSubmit} style={{ marginTop: '10px', backgroundColor: '#00ff00', color: '#000', border: 'none', padding: '10px', cursor: 'pointer' }}>
        Giriş Yap
      </button>
    </div>
  );
}
