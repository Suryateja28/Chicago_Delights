import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function OutletSelector({ isOpen, onClose }) {
  const { outlets, selectedOutlet, setOutlet, loadingOutlets } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (outlet) => {
    setOutlet(outlet);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-sans)' }}>
              Select Pizza Outlet
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Choose nearest store to view menu and place order
            </p>
          </div>
          {selectedOutlet && (
            <button 
              onClick={onClose} 
              style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}
              className="close-btn"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Search */}
        <div style={{ padding: '20px 24px 10px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-light)'
          }}>
            <span style={{ paddingLeft: '14px', color: 'var(--text-secondary)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search outlets (e.g. Lincoln Park)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 8px',
                fontSize: '0.9rem',
                border: 'none',
                background: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Body / List */}
        <div style={{
          padding: '10px 24px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {loadingOutlets ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="pizza-spinner" style={{ margin: '0 auto 10px' }}></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading stores...</p>
            </div>
          ) : filteredOutlets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <p>No outlets found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOutlets.map((outlet) => {
                const isSelected = selectedOutlet && (selectedOutlet.id === outlet.id || selectedOutlet._id === outlet._id);
                return (
                  <div
                    key={outlet.id || outlet._id}
                    onClick={() => handleSelect(outlet)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--border-radius-md)',
                      backgroundColor: isSelected ? 'rgba(229, 45, 39, 0.05)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    className="outlet-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {outlet.name}
                      </h3>
                      {isSelected && (
                        <span style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                      📍 {outlet.address}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      📞 {outlet.phone}
                      {' '}
                      <a
                        href={`https://wa.me/${String(outlet.phone).replace(/\D/g, '')}?text=Hi%20Chicago%20Delights%2C%20I%20want%20to%20order`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent)', marginLeft: '8px', textDecoration: 'none', fontWeight: '700' }}
                      >
                        WhatsApp
                      </a>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!selectedOutlet && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
              ⚠️ You must select an outlet to view items and order.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .outlet-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent) !important;
          box-shadow: 0 4px 12px rgba(255, 179, 0, 0.08);
        }
        .close-btn:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
