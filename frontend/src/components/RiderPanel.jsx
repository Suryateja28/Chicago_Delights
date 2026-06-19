import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../utils/api';

export default function RiderPanel({ isOpen, onClose }) {
  const { rider, riderLogout, assignRiderToOrder } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = () => {
    if (isOpen && rider) {
      setLoadingOrders(true);
      fetch(`${API_BASE}/api/rider/orders?phone=${encodeURIComponent(rider.phone)}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error("Failed to fetch rider orders:", err);
          setLoadingOrders(false);
        });
    }
  };

  useEffect(() => {
    fetchOrders();
    // Setting up a polling mechanism to keep it fresh
    let interval;
    if (isOpen && rider) {
      interval = setInterval(fetchOrders, 10000);
    }
    return () => clearInterval(interval);
  }, [isOpen, rider]);

  if (!isOpen) return null;

  if (!rider) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h2>Rider Access Required</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please sign in as a rider to manage deliveries.</p>
          <button onClick={onClose} className="glow-btn" style={{ width: '100%', marginTop: '16px' }}>Close</button>
        </div>
      </div>
    );
  }

  const handleAcceptOrder = async (orderId) => {
    const updated = await assignRiderToOrder(orderId, { name: rider.name, phone: rider.phone });
    if (updated) {
      fetchOrders();
    }
  };

  const availableOrders = orders.filter(o => o.status === 'Ready for Pickup');
  const myDeliveries = orders.filter(o => o.status === 'Out for Delivery');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Rider Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Welcome, {rider.name}</p>
          </div>
          <button onClick={onClose} className="close-btn" style={{ fontSize: '1.2rem' }}>✕</button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Available for Pickup ({availableOrders.length})</h3>
          {loadingOrders && orders.length === 0 ? (
            <p>Loading orders...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
              {availableOrders.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No orders currently waiting for pickup.</p>
              ) : (
                availableOrders.map((order, index) => (
                  <div key={order._id || order.id || index} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Order #{order.orderNumber}</strong>
                      <span style={{ color: 'var(--brand-primary)' }}>₹{order.total?.toFixed(2)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>To:</strong> {order.customer?.address || order.customer?.name}
                    </p>
                    <p style={{ margin: '5px 0 10px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => handleAcceptOrder(order._id || order.id)}
                      className="glow-btn"
                      style={{ padding: '8px 16px', fontSize: '0.9rem', width: '100%' }}
                    >
                      Accept & Pick up
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>My Active Deliveries ({myDeliveries.length})</h3>
          {myDeliveries.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You have no active deliveries.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
              {myDeliveries.map((order, index) => (
                <div key={order._id || order.id || index} style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid #25D366', padding: '15px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>Order #{order.orderNumber}</strong>
                    <span style={{ color: '#25D366', fontWeight: 'bold' }}>Out for Delivery</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Deliver To:</strong> {order.customer?.address}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>Phone:</strong> {order.customer?.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            riderLogout();
            onClose();
          }}
          className="ghost-btn"
          style={{ width: '100%', padding: '12px', border: '1px solid var(--border-light)', background: 'transparent', color: 'white' }}
        >
          Logout Rider
        </button>
      </div>
    </div>
  );
}
