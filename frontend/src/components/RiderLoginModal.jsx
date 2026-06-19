import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function RiderLoginModal({ isOpen, onClose }) {
  const { rider, riderLogin } = useCart();
  const [name, setName] = useState(rider?.name || '');
  const [phone, setPhone] = useState(rider?.phone || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number to continue.');
      return;
    }

    riderLogin({ name: name.trim(), phone: phone.trim() });
    onClose();
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
            Rider name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tony Rider"
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
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
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
