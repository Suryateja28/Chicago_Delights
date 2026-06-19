import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function LoginModal({ isOpen, onClose }) {
  const { user, login } = useCart();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password to continue.');
      return;
    }
    
    // Using email username as display name if needed
    const name = email.split('@')[0];
    login({ name: name, email: email.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Login to Order</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in with your email and password to place your order.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: '#f5f5f7' }}>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                color: '#f5f5f7'
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: '#f5f5f7' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                color: '#f5f5f7'
              }}
            />
          </label>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{error}</p>
          )}

          <button type="submit" className="glow-btn" style={{ padding: '14px 20px', width: '100%' }}>
            Continue
          </button>

          <button type="button" onClick={onClose} style={{ marginTop: '4px', color: 'var(--text-secondary)', borderRadius: '14px', padding: '12px 14px', border: '1px solid var(--border-light)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
