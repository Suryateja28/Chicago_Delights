import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

import { API_BASE } from '../utils/api';

export default function RiderLoginModal({ isOpen, onClose }) {
  const { rider, riderLogin } = useCart();
  const [phone, setPhone] = useState(rider?.phone || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Please enter your phone number and password to continue.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/rider/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        riderLogin(data.rider);
        setError('');
        setPassword('');
        onClose();
      } else {
        setError(data.error || 'Invalid driver credentials.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Rider Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in as a rider to accept orders and start delivery.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: '#f5f5f7' }}>
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
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
              placeholder="Enter driver password"
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
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
          )}

          <button type="submit" className="glow-btn" style={{ padding: '14px 20px', width: '100%' }}>
            Continue as Rider
          </button>

          <button type="button" onClick={onClose} style={{ marginTop: '4px', color: 'var(--text-secondary)', borderRadius: '14px', padding: '12px 14px', border: '1px solid var(--border-light)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
