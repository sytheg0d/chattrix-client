import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [roles, setRoles] = useState({});

  // Kullanıcıları çek
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

  // Logları çek
  const fetchLogs = async () => {
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Loglar alınamadı:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 10000); // 10 saniyede bir logları yenile

    return () => clearInterval(interval);
  }, []);

  // Rol değiştirme
  const updateRole = async (username) => {
    try {
      await axios.post('https://chattrix-server.onrender.com/update-role', {
        username,
        newRole: roles[username]
      });
      alert('Rol başarıyla güncellendi.');
      fetchUsers();
    } catch (err) {
      console.error('Rol güncellenemedi:', err);
    }
  };

  // Kullanıcı silme
  const deleteUser = async (username) => {
    if (window.confirm(`${username} adlı kullanıcıyı silmek istediğine emin misin?`)) {
      try {
        await axios.post('https://chattrix-server.onrender.com/delete-user', { username });
        alert('Kullanıcı silindi.');
        fetchUsers();
      } catch (err) {
        console.error('Kullanıcı silinemedi:', err);
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#00ff00', minHeight: '100vh' }}>
      <h1>Admin Panel</h1>

      <h2>Kullanıcılar</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>Kullanıcı Adı</th>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>Rol</th>
            <th style={{ border: '1px solid #00ff00', padding: '8px' }}>İşlemler</th>
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
                  style={{
                    backgroundColor: '#000',
                    color: '#00ff00',
                    border: '1px solid #00ff00',
                    padding: '5px'
                  }}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td style={{ border: '1px solid #00ff00', padding: '8px' }}>
                <button
                  onClick={() => updateRole(user.username)}
                  style={{
                    marginRight: '10px',
                    backgroundColor: '#00ff00',
                    color: '#000',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Rolü Güncelle
                </button>
                <button
                  onClick={() => deleteUser(user.username)}
                  style={{
                    backgroundColor: '#ff0000',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Kullanıcıyı Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Giriş/Çıkış Logları</h2>
      <div style={{
        backgroundColor: '#111',
        padding: '15px',
        border: '1px solid #00ff00',
        height: '300px',
        overflowY: 'auto',
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
