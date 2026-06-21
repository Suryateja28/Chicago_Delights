import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CartSidebar({ onOpenLogin }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    deliveryCharge,
    deliveryType,
    setDeliveryType,
    orderTakingOpen,
    total,
    couponCode,
    setCouponCode,
    couponApplied,
    applyCoupon,
    removeCoupon,
    couponError,
    submitOrder,
    isBogoDay,
    user
  } = useCart();

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((qty, item) => qty + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    applyCoupon(couponCode);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderTakingOpen) {
      alert('Order intake is currently paused. Please try again later.');
      return;
    }
    if (!user) {
      alert('Please login before placing your order.');
      onOpenLogin();
      return;
    }

    if (!customerDetails.phone) {
      alert('Please fill in your phone number.');
      return;
    }

    if (deliveryType === 'delivery' && !customerDetails.address) {
      alert('Please provide your hostel.');
      return;
    }

    if (!customerDetails.notes) {
      alert('Please specify your pizza type.');
      return;
    }

    const order = await submitOrder({
      ...customerDetails,
      name: user.name || 'Customer'
    });
    if (order) {
      setCheckoutMode(false);
      setCustomerDetails({ name: '', phone: '', address: '', notes: '' });
    }
  };

  return (
    <>
      {/* Background Overlay */}
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Drawer Panel */}
      <div 
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
          borderLeft: '1px solid var(--border-light)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛒</span> {checkoutMode ? 'Delivery Checkout' : 'My Cart'}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}
            className="close-btn"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px' }}>
          {!orderTakingOpen && (
            <div style={{
              marginBottom: '18px',
              padding: '14px',
              borderRadius: '18px',
              backgroundColor: 'rgba(255, 0, 0, 0.08)',
              border: '1px solid rgba(255, 0, 0, 0.18)',
              color: 'var(--danger)'
            }}>
              ⚠️ Order intake is currently paused by the kitchen. New orders cannot be placed until intake is resumed.
            </div>
          )}
          {cart.length === 0 && !checkoutMode ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>🍕</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Your Cart is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 20px 24px' }}>
                Browse our mouthwatering pizzas and customize your favorite deep dish with extra cheese, toppings, and signature crusts!
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="glow-btn"
                style={{ padding: '10px 24px', fontSize: '0.85rem' }}
              >
                Explore Pizza Menu
              </button>
            </div>
          ) : !checkoutMode ? (
            /* CART LIST VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '18px',
                    borderRadius: '22px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)'
                  }}
                >
                  {/* Veg/Non-Veg dot */}
                  <span style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: item.isVeg ? 'var(--success)' : 'var(--danger)',
                    marginTop: '8px',
                    flexShrink: 0
                  }} />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>{item.name}</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.5' }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent)' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {item.size && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                        <strong>Size:</strong> {item.size} {item.crust ? `| Crust: ${item.crust}` : ''}
                      </p>
                    )}
                    {item.toppings && item.toppings.length > 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                        <strong>Toppings:</strong> {item.toppings.join(', ')}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem'
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(index)}
                        style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: '700', background: 'transparent', border: 'none' }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ padding: '20px', borderRadius: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  <span>{deliveryType === 'delivery' ? 'Delivery Charge' : 'Dine-In Service'}</span>
                  <span>₹{deliveryCharge.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '10px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem' }}>
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Automatic BOGO Promo Status */}
              {isBogoDay() && (
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'rgba(255, 179, 0, 0.06)',
                  border: '1px dashed var(--accent)',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}>
                  🎉 <strong>Wednesday/Friday BOGO Activated!</strong> The lowest priced Medium, Large, or Monster pizza in your cart is automatically free!
                </div>
              )}

              {/* Promo code area */}
              {!isBogoDay() && (
                <div style={{ marginTop: '16px' }}>
                  {couponApplied ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(0, 200, 83, 0.05)',
                      border: '1px solid var(--success)',
                      color: 'var(--success)',
                      fontSize: '0.85rem'
                    }}>
                      <span>🏷️ Coupon <strong>{couponApplied}</strong> Applied</span>
                      <button onClick={removeCoupon} style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="ENTER PROMO CODE (e.g. FREEGD)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--border-radius-sm)',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase'
                        }}
                      />
                      <button 
                        type="submit"
                        style={{
                          padding: '0 16px',
                          borderRadius: 'var(--border-radius-sm)',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '6px' }}>
                      ❌ {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Order Type
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: `1px solid ${deliveryType === 'delivery' ? 'var(--accent)' : 'var(--border-light)'}`,
                      backgroundColor: deliveryType === 'delivery' ? 'rgba(255, 179, 0, 0.08)' : 'var(--bg-input)',
                      color: deliveryType === 'delivery' ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('dine-in')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: `1px solid ${deliveryType === 'dine-in' ? 'var(--accent)' : 'var(--border-light)'}`,
                      backgroundColor: deliveryType === 'dine-in' ? 'rgba(255, 179, 0, 0.08)' : 'var(--bg-input)',
                      color: deliveryType === 'dine-in' ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    Dine-In
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Hostel
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="E.g., Boys Hostel, Block A"
                  value={customerDetails.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Pizza Type (Capsicum, Onion, Tomato, etc.)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Capsicum, Onion, Tomato, etc."
                  value={customerDetails.notes}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: paymentMethod === 'cod' ? 'rgba(255, 179, 0, 0.04)' : 'var(--bg-input)',
                    border: `1px solid ${paymentMethod === 'cod' ? 'var(--accent)' : 'var(--border-light)'}`,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Cash on Delivery</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Pay cash or card at the doorstep</p>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: paymentMethod === 'card' ? 'rgba(255, 179, 0, 0.04)' : 'var(--bg-input)',
                    border: `1px solid ${paymentMethod === 'card' ? 'var(--accent)' : 'var(--border-light)'}`,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Simulated Card (Mock Credit Card)</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Check out instantly with simulated payment gateway</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Summary (Sticky at bottom) */}
        {cart.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            {/* Bill Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--success)' }}>
                  <span>Discounts</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>{deliveryType === 'delivery' ? 'Delivery Charge' : 'Dine-In Service'}</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: '800',
                color: 'white',
                borderTop: '1px dashed var(--border-light)',
                paddingTop: '10px',
                marginTop: '4px'
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTAs */}
            {checkoutMode ? (
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutMode(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    color: 'white'
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="glow-btn"
                  style={{ flex: 2, padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Place Order <span>🚀</span>
                </button>
              </div>
            ) : (
              orderTakingOpen ? (
                user ? (
                  <button
                    onClick={() => setCheckoutMode(true)}
                    className="glow-btn"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Proceed to Checkout <span>➔</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="glow-btn"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Login to Checkout <span>🔐</span>
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="glow-btn"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }}
                >
                  Order Intake Paused
                </button>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}
