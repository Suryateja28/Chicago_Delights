import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function OrderTracker() {
  const { activeOrder, setActiveOrder, trackActiveOrder, rider, assignRiderToOrder } = useCart();

  useEffect(() => {
    if (!activeOrder) return;

    // Poll the backend every 4 seconds to get live status updates
    const timer = setInterval(() => {
      const orderId = activeOrder._id || activeOrder.id;
      trackActiveOrder(orderId);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeOrder, trackActiveOrder]);

  if (!activeOrder) return null;

  const orderId = activeOrder._id || activeOrder.id;
  const status = activeOrder.status || 'Received';

  const steps = [
    { label: 'Received', icon: '📝', desc: 'Order received by the kitchen', eta: '2 min' },
    { label: 'Preparing', icon: '👨‍🍳', desc: 'Prepping fresh dough & toppings', eta: '15 min' },
    { label: 'Baking', icon: '🔥', desc: 'Baking in our high-temp brick oven', eta: '20 min' },
    { label: 'Ready for Pickup', icon: '📦', desc: 'Order is waiting for a rider to take it', eta: 'Rider pickup' },
    { label: 'Out for Delivery', icon: '🛵', desc: 'Rider is on the way with your hot pizza', eta: '15 min' },
    { label: 'Delivered', icon: '🎁', desc: 'Enjoy your Chicago Delights!', eta: 'Done' }
  ];

  // Dynamically calculate status based on time elapsed if order is still 'Received' in DB
  let displayStatus = status;
  if (status === 'Received' || status === 'Pending') {
    const createdAt = activeOrder.createdAt ? new Date(activeOrder.createdAt).getTime() : Date.now();
    const minutesElapsed = (Date.now() - createdAt) / (1000 * 60);

    if (minutesElapsed >= 40) {
      displayStatus = 'Ready for Pickup';
    } else if (minutesElapsed >= 20) {
      displayStatus = 'Baking';
    } else if (minutesElapsed >= 2) {
      displayStatus = 'Preparing';
    }
  }

  const currentStepIndex = steps.findIndex(step => step.label.toLowerCase() === displayStatus.toLowerCase());

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '0 20px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Back to Menu header */}
      <button 
        onClick={() => setActiveOrder(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '24px'
        }}
      >
        ← Return to Menu
      </button>

      {/* Visual Tracking Card */}
      <div className="glass" style={{
        borderRadius: 'var(--border-radius-lg)',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-light)',
        marginBottom: '24px'
      }}>
        {/* Tracking Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Tracking Order
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-sans)', marginTop: '4px' }}>
              #{activeOrder.orderNumber || (orderId.substring(orderId.length - 8))}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</span>
            <div style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: displayStatus === 'Delivered' ? 'var(--success)' : 'var(--accent)',
              marginTop: '4px'
            }}>
              {displayStatus}
            </div>
          </div>
        </div>

        {/* Live Visual Timeline */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: '40px',
          overflowX: 'auto',
          paddingBottom: '10px'
        }}>
          {/* Connecting Line */}
          <div style={{
            position: 'absolute',
            top: '25px',
            left: '30px',
            right: '30px',
            height: '4px',
            backgroundColor: 'var(--bg-input)',
            zIndex: 1,
            pointerEvents: 'none'
          }} />
          
          <div style={{
            position: 'absolute',
            top: '25px',
            left: '30px',
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            height: '4px',
            backgroundColor: 'var(--primary)',
            boxShadow: '0 0 10px var(--primary-glow)',
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'width 0.8s ease'
          }} />

          {/* Timeline Nodes */}
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  minWidth: '90px',
                  textAlign: 'center'
                }}
              >
                {/* Node bubble */}
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--primary)' : isCompleted ? 'var(--bg-card)' : 'var(--bg-input)',
                  border: `2px solid ${isActive || isCompleted ? 'var(--primary)' : 'var(--border-light)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none',
                  animation: isActive ? 'pulseGlow 2s infinite' : 'none',
                  transition: 'all 0.5s ease'
                }}>
                  {step.icon}
                </div>

                <h3 style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive || isCompleted ? '700' : '500',
                  color: isActive ? 'var(--accent)' : isCompleted ? 'white' : 'var(--text-secondary)',
                  marginTop: '12px'
                }}>
                  {step.label}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {step.eta}
                </span>
              </div>
            );
          })}
        </div>

        {status === 'Ready for Pickup' && (
          <div style={{
            marginTop: '18px',
            padding: '20px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: 'var(--text-secondary)'
          }}>
            {activeOrder.rider?.name ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <strong style={{ color: 'white' }}>{activeOrder.rider.name}</strong>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
                    Rider assigned · {activeOrder.rider.phone}
                  </p>
                </div>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>Picking up now</span>
              </div>
            ) : rider ? (
              <button
                onClick={() => assignRiderToOrder(orderId, { name: rider.name, phone: rider.phone })}
                className="glow-btn"
                style={{ padding: '12px 18px', width: '100%', marginTop: '12px' }}
              >
                Claim order and start delivery
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span>Rider login is required to claim this order.</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Use the Rider Login button in the header to initialize delivery.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action/Helper details */}
        <div style={{
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: status !== 'Delivered' ? 'spinSlow 10s linear infinite' : 'none' }}>🍕</span>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>
              {steps[currentStepIndex]?.desc || 'Preparing order...'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              {status === 'Delivered' 
                ? 'Thank you for ordering with Chicago Delights! Hope you loved our monster pizza.'
                : 'Pizzas are baked at 450°C for the ultimate deep dish crunch. We are cooking as fast as possible!'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary & Customer Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Order Details */}
        <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            Items Ordered
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeOrder.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div>
                  <strong>{item.quantity}x {item.name}</strong>
                  {item.size && (
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', marginTop: '2px' }}>
                      ({item.size} - {item.crust})
                    </span>
                  )}
                  {item.toppings && item.toppings.length > 0 && (
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', marginTop: '1px' }}>
                      + {item.toppings.join(', ')}
                    </span>
                  )}
                </div>
                <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            borderTop: '1px dashed var(--border-light)',
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{activeOrder.subtotal?.toFixed(2)}</span>
            </div>
            {activeOrder.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--success)' }}>
                <span>Discounts Applied</span>
                <span>-₹{activeOrder.discount?.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>{activeOrder.deliveryType === 'delivery' ? 'Delivery Charge' : 'Dine-In'}</span>
              <span>₹{activeOrder.deliveryCharge?.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: '800',
              color: 'var(--accent)',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '8px',
              marginTop: '4px'
            }}>
              <span>Total Paid</span>
              <span>₹{activeOrder.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            Delivery Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Recipient Name</span>
              <strong style={{ color: 'white', marginTop: '2px', display: 'block' }}>{activeOrder.customer?.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
              <strong style={{ color: 'white', marginTop: '2px', display: 'block' }}>{activeOrder.customer?.phone}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Delivery Address</span>
              <strong style={{ color: 'white', marginTop: '2px', display: 'block', lineHeight: '1.4' }}>{activeOrder.customer?.address}</strong>
            </div>
            {activeOrder.customer?.notes && (
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Driver Notes</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>"{activeOrder.customer.notes}"</p>
              </div>
            )}
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Outlet Branch</span>
              <strong style={{ color: 'white', marginTop: '2px', display: 'block' }}>{activeOrder.outletName}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
