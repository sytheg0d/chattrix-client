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
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#00ff00', minHeight: '100vh' }}>
      <h1>Admin Panel</h1>
      {/* Loading indicators for better UX */}
      {loadingUsers && <div>Loading users...</div>}
      {loadingLogs && <div>Loading logs...</div>}
      {loadingBannedIps && <div>Loading banned IPs...</div>}
      {/* Admin functionalities (tables for users, logs, and banned IPs) */}
    </div>
  );
}
