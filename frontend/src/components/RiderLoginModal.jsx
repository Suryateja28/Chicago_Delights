import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

import { API_BASE } from '../utils/api';

export default function RiderLoginModal({ isOpen, onClose }) {
  const { rider, riderLogin } = useCart();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(rider?.phone || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!phone.trim() || !password.trim() || (isRegistering && !name.trim())) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const endpoint = isRegistering ? '/api/rider/register' : '/api/rider/login';
      const body = isRegistering 
        ? { name: name.trim(), phone: phone.trim(), password: password.trim() }
        : { phone: phone.trim(), password: password.trim() };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        if (isRegistering) {
          setSuccessMsg(data.message);
          setIsRegistering(false);
          setPassword('');
        } else {
          riderLogin(data.rider);
          setPassword('');
          onClose();
        }
      } else {
        setError(data.error || 'Request failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{isRegistering ? 'Register as Rider' : 'Rider Login'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isRegistering ? 'Apply to become a rider. An admin must approve your account.' : 'Sign in as a rider to accept orders and start delivery.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegistering && (
            <label style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: '#f5f5f7' }}>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          )}
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
          {successMsg && (
            <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{successMsg}</p>
          )}

          <button type="submit" className="glow-btn" style={{ padding: '14px 20px', width: '100%' }}>
            {isRegistering ? 'Submit Application' : 'Continue as Rider'}
          </button>

          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>
            {isRegistering ? 'Already have an account? Login' : 'New rider? Apply here'}
          </button>

          <button type="button" onClick={onClose} style={{ marginTop: '4px', color: 'var(--text-secondary)', borderRadius: '14px', padding: '12px 14px', border: '1px solid var(--border-light)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
