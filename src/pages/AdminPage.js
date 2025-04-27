import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [roles, setRoles] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingBannedIps, setLoadingBannedIps] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/get-users');
      console.log("Kullanıcılar:", res.data);  // Veriyi kontrol etmek için ekledik
      setUsers(res.data);
      const initialRoles = {};
      res.data.forEach(user => {
        initialRoles[user.username] = user.role;
      });
      setRoles(initialRoles);
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/logs');
      console.log("Loglar:", res.data);  // Log verisini kontrol et
      setLogs(res.data);
    } catch (err) {
      console.error('Loglar alınamadı:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchBannedIps = async () => {
    setLoadingBannedIps(true);
    try {
      const res = await axios.get('https://chattrix-server.onrender.com/banned-ips');
      console.log("Banlı IP'ler:", res.data);  // Banlı IP'yi kontrol et
      setBannedIps(res.data);
    } catch (err) {
      console.error('Banlı IPler alınamadı:', err);
    } finally {
      setLoadingBannedIps(false);
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
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* Loading indicators for better UX */}
      {loadingUsers && <div>Loading users...</div>}
      {loadingLogs && <div>Loading logs...</div>}
      {loadingBannedIps && <div>Loading banned IPs...</div>}

      {/* Kullanıcılar Tablosu */}
      <h2>Kullanıcılar</h2>
      <table>
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Rol</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>@{user.username}</td>
              <td>
                <select
                  value={roles[user.username] || 'user'}
                  onChange={(e) => setRoles({ ...roles, [user.username]: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => updateRole(user.username)}>Rolü Güncelle</button>
                <button onClick={() => deleteUser(user.username)} className="delete">Kullanıcıyı Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Banlı IP'ler Tablosu */}
      <h2>Banlı IP'ler</h2>
      <div>
        {bannedIps.map(ip => (
          <div key={ip._id}>
            {ip.ip}
            <button onClick={() => unbanIp(ip.ip)} className="unban">Banı Kaldır</button>
          </div>
        ))}
      </div>

      {/* Giriş / Çıkış Logları */}
      <h2>Giriş / Çıkış Logları</h2>
      <div>
        {logs.map(log => (
          <div key={log._id}>
            [{log.timestamp}] ➤ {log.username} ({log.type.toUpperCase()}) IP: {log.ip}
          </div>
        ))}
      </div>
    </div>
  );
}
