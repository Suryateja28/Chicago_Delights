import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../utils/api';

export default function AdminPanel({ isOpen, onClose }) {
  const { admin, orderTakingOpen, toggleOrderTaking, adminLogout } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = () => {
    if (isOpen && admin) {
      fetch(`${API_BASE}/api/admin/orders`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error("Failed to fetch orders:", err);
          setLoadingOrders(false);
        });
    }
  };

  useEffect(() => {
    if (isOpen && admin) {
      setLoadingOrders(true);
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, admin]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    await toggleOrderTaking(!orderTakingOpen);
  };

  if (!admin) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h2>Admin Access Required</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please sign in as admin to manage order intake.</p>
          <button onClick={onClose} className="glow-btn" style={{ width: '100%', marginTop: '16px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Fixed Header Section */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Admin Panel</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Manage kitchen intake and view orders.</p>
            </div>
            <button onClick={onClose} className="close-btn" style={{ fontSize: '1.2rem' }}>✕</button>
          </div>

          <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Current intake status:</p>
            <strong style={{ display: 'block', marginTop: '10px', fontSize: '1.2rem', color: orderTakingOpen ? 'var(--success)' : 'var(--danger)' }}>
              {orderTakingOpen ? 'OPEN' : 'CLOSED'}
            </strong>
          </div>

          <button
            onClick={handleToggle}
            className="glow-btn"
            style={{ width: '100%', padding: '14px', marginBottom: '20px' }}
          >
            {orderTakingOpen ? 'Pause Order Intake' : 'Resume Order Intake'}
          </button>
        </div>

        {/* Scrollable Orders Section */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Total Orders: {orders.length}</h3>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No orders found.</p>
              ) : (
                orders.map((order, index) => (
                  <div key={order._id || order.id || index} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Order #{order.orderNumber}</strong>
                      <span style={{ color: 'var(--brand-primary)' }}>₹{order.total?.toFixed(2)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>Status:</strong> <span style={{ color: order.status === 'Delivered' ? 'var(--success)' : (order.status === 'Out for Delivery' ? '#25D366' : '#fff') }}>{order.status}</span>
                    </p>
                    {order.rider && (
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Rider:</strong> {order.rider.name} ({order.rider.phone})
                      </p>
                    )}
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                      {order.items?.map((item, i) => (
                        <div key={i}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer Section */}
        <div style={{ flexShrink: 0 }}>
          <button
            onClick={adminLogout}
            className="ghost-btn"
            style={{ width: '100%', padding: '12px', border: '1px solid var(--border-light)', background: 'transparent', color: 'white' }}
          >
            Logout Admin
          </button>
        </div>
      </div>
    </div>
  );
}
