import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../utils/api';

export default function AdminPanel({ isOpen, onClose }) {
  const { admin, orderTakingOpen, toggleOrderTaking, adminLogout } = useCart();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'riders'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);

  const fetchOrders = () => {
    if (isOpen && admin) {
      fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 'x-admin-secret': admin.token || '' }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error("Orders API Error:", data);
            setOrders([]);
            if (data.error && data.error.includes('Unauthorized')) adminLogout();
          }
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error("Failed to fetch orders:", err);
          setLoadingOrders(false);
        });
    }
  };

  const fetchRiders = () => {
    if (isOpen && admin) {
      fetch(`${API_BASE}/api/admin/riders`, {
        headers: { 'x-admin-secret': admin.token || '' }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRiders(data);
          } else {
            console.error("Riders API Error:", data);
            setRiders([]);
            if (data.error && data.error.includes('Unauthorized')) adminLogout();
          }
          setLoadingRiders(false);
        })
        .catch(err => {
          console.error("Failed to fetch riders:", err);
          setLoadingRiders(false);
        });
    }
  };

  const handleApproveRider = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/riders/${id}/approve`, { 
        method: 'POST',
        headers: { 'x-admin-secret': admin.token || '' }
      });
      if (res.ok) {
        fetchRiders(); // refresh list
      } else {
        alert('Failed to approve rider');
      }
    } catch (err) {
      alert('Error approving rider');
    }
  };

  const handleRestartOrders = async () => {
    if (window.confirm("⚠️ WARNING ⚠️\n\nAre you sure you want to PERMANENTLY delete all orders from the database? This will reset the order counter to #1.\n\nThis action cannot be undone.")) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/restart-orders`, { 
          method: 'POST',
          headers: { 'x-admin-secret': admin.token || '' }
        });
        if (res.ok) {
          alert('Database cleaned! Next order will be #1.');
          fetchOrders();
        } else {
          alert('Failed to restart orders.');
        }
      } catch (err) {
        alert('Error restarting orders.');
      }
    }
  };

  useEffect(() => {
    if (isOpen && admin) {
      if (activeTab === 'orders') {
        setLoadingOrders(true);
        fetchOrders();
      } else if (activeTab === 'riders') {
        setLoadingRiders(true);
        fetchRiders();
      }
      
      const interval = setInterval(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'riders') fetchRiders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, admin, activeTab]);

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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Fixed Header Section */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Admin Panel</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>Manage kitchen and riders.</p>
            </div>
            <button onClick={onClose} className="close-btn" style={{ fontSize: '1.2rem' }}>✕</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'orders' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 'bold' }}>
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('riders')}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'riders' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 'bold' }}>
              Riders
            </button>
          </div>

          {activeTab === 'orders' && (
            <>
              <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Current intake status:</p>
                    <strong style={{ display: 'block', marginTop: '10px', fontSize: '1.2rem', color: orderTakingOpen ? 'var(--success)' : 'var(--danger)' }}>
                      {orderTakingOpen ? 'OPEN' : 'CLOSED'}
                    </strong>
                  </div>
                  <button onClick={handleRestartOrders} style={{ padding: '8px 12px', background: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30', border: '1px solid #ff3b30', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Restart Orders
                  </button>
                </div>
              </div>

              <button
                onClick={handleToggle}
                className="glow-btn"
                style={{ width: '100%', padding: '14px', marginBottom: '20px' }}
              >
                {orderTakingOpen ? 'Pause Order Intake' : 'Resume Order Intake'}
              </button>
            </>
          )}
        </div>

        {/* Scrollable Section */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '20px', flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {activeTab === 'orders' ? (
            <>
              <h3 style={{ marginBottom: '15px' }}>Total Orders: {orders?.length || 0}</h3>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(!Array.isArray(orders) || orders.length === 0) ? (
                <p style={{ color: 'var(--text-secondary)' }}>No orders found.</p>
              ) : (
                (orders || []).map((order, index) => {
                  const orderId = order._id || order.id || index;
                  const isExpanded = expandedOrderId === orderId;

                  return (
                    <div 
                      key={orderId} 
                      onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '15px', 
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        border: isExpanded ? '1px solid var(--brand-primary)' : '1px solid transparent'
                      }}
                    >
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

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div style={{
                          marginTop: '15px',
                          paddingTop: '15px',
                          borderTop: '1px dashed rgba(255,255,255,0.1)',
                          animation: 'fadeIn 0.3s ease-out'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--brand-primary)' }}>Customer Details</h4>
                          {order.customer ? (
                            <>
                              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Name:</strong> {order.customer.name || 'N/A'}</p>
                              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Phone:</strong> {order.customer.phone || 'N/A'}</p>
                              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}><strong>Address:</strong> {order.customer.address || 'Pickup / N/A'}</p>
                              {order.customer.notes && (
                                <p style={{ margin: '0', fontSize: '0.85rem', color: '#ffd073' }}>
                                  <strong>Notes:</strong> {order.customer.notes}
                                </p>
                              )}
                            </>
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No customer info available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          </>
          ) : (
            <>
              <h3 style={{ marginBottom: '15px' }}>Rider Management</h3>
              {loadingRiders ? (
                <p>Loading riders...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(!Array.isArray(riders) || riders.length === 0) ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No riders found.</p>
                  ) : (
                    (riders || []).map((r, index) => (
                      <div key={r._id || index} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{r.name}</strong>
                          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.phone}</p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: r.status === 'approved' ? 'var(--success)' : '#ffd073' }}>
                            Status: {r.status}
                          </p>
                        </div>
                        {r.status === 'pending' && (
                          <button 
                            onClick={() => handleApproveRider(r._id)}
                            style={{ padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Approve
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
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
