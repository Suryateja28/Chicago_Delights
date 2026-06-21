import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function AdminLoginModal({ isOpen, onClose }) {
  const { adminLogin, admin } = useCart();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password.trim() === 'pizza123') {
      adminLogin({ name: 'Admin User', role: 'admin' });
      setError('');
      setUsername('');
      setPassword('');
      onClose();
      return;
    }
    setError('Invalid admin credentials.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Admin Login</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Enter admin credentials to manage order intake.</p>
          </div>
          <button onClick={onClose} className="close-btn" style={{ fontSize: '1.2rem' }}>✕</button>
        </div>

        {admin ? (
          <div style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            You are already logged in as an admin.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-input)', color: 'inherit' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-input)', color: 'inherit' }}
              />
            </label>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" className="glow-btn" style={{ width: '100%', padding: '12px' }}>
              Sign In as Admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
